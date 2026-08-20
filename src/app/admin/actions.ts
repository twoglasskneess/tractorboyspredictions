"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function createUser(formData: FormData) {
  await checkAdmin();
  const username = formData.get("username") as string;
  const display_name = formData.get("display_name") as string;
  const password = formData.get("password") as string;
  
  const password_hash = await bcrypt.hash(password, 10);
  
  await prisma.user.create({
    data: { username, display_name, password_hash }
  });
  
  revalidatePath("/admin/users");
}

export async function resetPassword(userId: string, formData: FormData) {
  await checkAdmin();
  const password = formData.get("password") as string;
  const password_hash = await bcrypt.hash(password, 10);
  
  await prisma.user.update({
    where: { id: userId },
    data: { password_hash }
  });
  revalidatePath("/admin/users");
}

export async function createPlayer(formData: FormData) {
  await checkAdmin();
  const player_name = formData.get("player_name") as string;
  const position = formData.get("position") as string;
  const shirt_number_str = formData.get("shirt_number") as string;
  const shirt_number = shirt_number_str ? parseInt(shirt_number_str) : null;
  
  await prisma.squad.create({
    data: { player_name, position, shirt_number, is_active: true }
  });
  revalidatePath("/admin/squad");
}

export async function editPlayer(id: string, formData: FormData) {
  await checkAdmin();
  const player_name = formData.get("player_name") as string;
  const position = formData.get("position") as string;
  const shirt_number_str = formData.get("shirt_number") as string;
  const shirt_number = shirt_number_str ? parseInt(shirt_number_str) : null;
  
  await prisma.squad.update({
    where: { id },
    data: { player_name, position, shirt_number }
  });
  revalidatePath("/admin/squad");
}

export async function togglePlayerActive(id: string, current: boolean) {
  await checkAdmin();
  await prisma.squad.update({
    where: { id },
    data: { is_active: !current }
  });
  revalidatePath("/admin/squad");
}

export async function createFixture(formData: FormData) {
  await checkAdmin();
  const opponent_name = formData.get("opponent_name") as string;
  const match_date = new Date(formData.get("match_date") as string);
  const lock_time = new Date(formData.get("lock_time") as string);
  
  await prisma.fixture.create({
    data: { opponent_name, match_date, lock_time }
  });
  revalidatePath("/admin/fixtures");
}

export async function submitFixtureResult(fixtureId: string, formData: FormData) {
  await checkAdmin();
  const actual_home_score = parseInt(formData.get("actual_home_score") as string);
  const actual_away_score = parseInt(formData.get("actual_away_score") as string);
  
  // Collecting actual lineup from the 11 dropdowns
  const actual_lineup_arr = [];
  for (let i = 0; i < 11; i++) {
    const val = formData.get(`player_${i}`);
    if (val) actual_lineup_arr.push(val as string);
  }
  
  const actual_lineup = JSON.stringify(actual_lineup_arr);

  await prisma.fixture.update({
    where: { id: fixtureId },
    data: {
      actual_home_score,
      actual_away_score,
      actual_lineup,
      status: "COMPLETED"
    }
  });

  // Fetch all users to recalculate their scores
  const users = await prisma.user.findMany();
  for (const user of users) {
    await recalculateUserScores(user.id);
  }

  revalidatePath("/admin/fixtures");
  revalidatePath("/dashboard");
}

async function recalculateUserScores(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      predictions: {
        include: { fixture: true }
      }
    }
  });
  if (!user) return;

  let matchTotal = 0;
  let lineupTotal = 0;

  for (const pred of user.predictions) {
    const f = pred.fixture;
    if (f.status === "COMPLETED" && f.actual_home_score !== null && f.actual_away_score !== null && f.actual_lineup) {
      // match score
      if (pred.predicted_home_score === f.actual_home_score && pred.predicted_away_score === f.actual_away_score) {
        matchTotal += 3;
      } else {
        const pDiff = pred.predicted_home_score - pred.predicted_away_score;
        const aDiff = f.actual_home_score - f.actual_away_score;
        const pRes = pDiff > 0 ? "W" : pDiff < 0 ? "L" : "D";
        const aRes = aDiff > 0 ? "W" : aDiff < 0 ? "L" : "D";
        if (pRes === aRes) matchTotal += 1;
      }

      // lineup score
      const actualLineup = JSON.parse(f.actual_lineup) as string[];
      const predLineup = JSON.parse(pred.predicted_lineup) as string[];
      predLineup.forEach(p => {
        if (actualLineup.includes(p)) lineupTotal++;
      });
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { match_score_total: matchTotal, lineup_score_total: lineupTotal }
  });
}
