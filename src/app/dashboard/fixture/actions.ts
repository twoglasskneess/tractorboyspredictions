"use server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitPrediction(fixtureId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const fixture = await prisma.fixture.findUnique({ where: { id: fixtureId } });
  if (!fixture || new Date() > new Date(fixture.lock_time)) {
    throw new Error("Fixture is locked or does not exist");
  }

  const predicted_home_score = parseInt(formData.get("predicted_home_score") as string);
  const predicted_away_score = parseInt(formData.get("predicted_away_score") as string);
  
  const lineup = [];
  for (let i = 0; i < 11; i++) {
    const val = formData.get(`player_${i}`);
    if (val) lineup.push(val as string);
  }
  
  if (new Set(lineup).size !== 11) {
    throw new Error("Duplicate players or incomplete lineup");
  }

  const predicted_lineup = JSON.stringify(lineup);

  const existing = await prisma.prediction.findFirst({
    where: { user_id: session.user.id, fixture_id: fixtureId }
  });

  if (existing) {
    await prisma.prediction.update({
      where: { id: existing.id },
      data: { predicted_home_score, predicted_away_score, predicted_lineup }
    });
  } else {
    await prisma.prediction.create({
      data: {
        user_id: session.user.id,
        fixture_id: fixtureId,
        predicted_home_score,
        predicted_away_score,
        predicted_lineup
      }
    });
  }

  revalidatePath(`/dashboard/fixture/${fixtureId}`);
}
