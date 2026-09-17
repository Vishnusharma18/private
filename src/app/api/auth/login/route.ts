import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { emailOrUsername, password } = await req.json();

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: "Email/Username and password are required." },
        { status: 400 }
      );
    }

    const query = emailOrUsername.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: query }, { username: query }],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

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
    console.error("Login error:", err);
    return NextResponse.json({ error: "Failed to log in." }, { status: 500 });
  }
}
