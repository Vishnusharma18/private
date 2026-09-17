import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
    }

    if (!token.startsWith("reset-")) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    const userId = token.split("-")[1];
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return NextResponse.json({ message: "Password successfully updated." });
  } catch (err) {
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
