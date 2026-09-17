import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      space: { select: { id: true, name: true, description: true, coverUrl: true } },
      inviter: { select: { displayName: true } },
    },
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

  return NextResponse.json({ invitation });
}
