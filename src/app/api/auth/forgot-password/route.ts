import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      // Return success to prevent email enumeration
      return NextResponse.json({ message: "If account exists, password reset instructions sent." });
    }

    // In local sandbox environment, return a dummy reset token
    return NextResponse.json({
      message: "Password reset request initiated.",
      resetToken: `reset-${user.id}-${Date.now()}`
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
