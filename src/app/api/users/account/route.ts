import { NextResponse } from "next/server";
import { getSession, clearSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if user is the sole owner of any space
    const ownedSpaces = await prisma.space.findMany({
      where: { ownerId: session.id },
    });

    if (ownedSpaces.length > 0) {
      // Transfer or delete spaces owned by user
      for (const space of ownedSpaces) {
        const otherMember = await prisma.membership.findFirst({
          where: { spaceId: space.id, NOT: { userId: session.id }, status: "ACTIVE" },
        });

        if (otherMember) {
          // Transfer ownership to next member
          await prisma.space.update({
            where: { id: space.id },
            data: { ownerId: otherMember.userId },
          });
          await prisma.membership.update({
            where: { id: otherMember.id },
            data: { role: "OWNER" },
          });
        } else {
          // Delete space if no other members
          await prisma.space.delete({ where: { id: space.id } });
        }
      }
    }

    await prisma.user.delete({ where: { id: session.id } });
    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
