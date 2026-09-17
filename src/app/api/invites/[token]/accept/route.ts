import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Authentication required to accept invitation" }, { status: 401 });
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  if (invitation.acceptedAt) {
    return NextResponse.json({ error: "Invitation has already been used" }, { status: 400 });
  }

  if (invitation.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
  }

  try {
    const existingMembership = await prisma.membership.findUnique({
      where: {
        spaceId_userId: {
          spaceId: invitation.spaceId,
          userId: session.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json({
        message: "You are already a member of this space.",
        spaceId: invitation.spaceId
      });
    }

    await prisma.$transaction([
      prisma.membership.create({
        data: {
          spaceId: invitation.spaceId,
          userId: session.id,
          role: invitation.role,
          status: "ACTIVE",
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true, spaceId: invitation.spaceId });
  } catch (err) {
    console.error("Accept invite error:", err);
    return NextResponse.json({ error: "Failed to accept invitation" }, { status: 500 });
  }
}
