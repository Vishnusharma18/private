import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { displayName, username, bio, avatarUrl } = await req.json();

    if (username) {
      const cleanUsername = username.toLowerCase().trim();
      const existing = await prisma.user.findFirst({
        where: {
          username: cleanUsername,
          NOT: { id: session.id },
        },
      });

      if (existing) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.id },
      data: {
        ...(displayName && { displayName: displayName.trim() }),
        ...(username && { username: username.toLowerCase().trim() }),
        ...(bio !== undefined && { bio: bio ? bio.trim() : null }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
