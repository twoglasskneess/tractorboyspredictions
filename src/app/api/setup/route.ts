import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json({ message: "Already setup" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash("adminpassword", 10);
    
    await prisma.user.create({
      data: {
        username: "admin",
        password_hash: passwordHash,
        display_name: "Admin User",
        role: "ADMIN"
      }
    });

    return NextResponse.json({ message: "Admin user created successfully. Username: admin, Password: adminpassword" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
