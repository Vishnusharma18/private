import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, displayName, username } = await req.json();

    if (!email || !password || !displayName || !username) {
      return NextResponse.json(
        { error: "Email, password, display name, and username are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanUsername }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email or username already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        username: cleanUsername,
        displayName: displayName.trim(),
        passwordHash,
      },
    });

    const token = createToken({ userId: user.id, email: user.email });
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Failed to register user." }, { status: 500 });
  }
}
