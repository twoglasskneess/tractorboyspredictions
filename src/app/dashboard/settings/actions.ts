"use server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export async function changeMyPassword(formData: FormData): Promise<{ error?: string, success?: boolean }> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const currentPassword = formData.get("current_password") as string;
  const newPassword = formData.get("new_password") as string;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User not found" };

  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    return { error: "Current password is incorrect" };
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password_hash: newHash }
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}
