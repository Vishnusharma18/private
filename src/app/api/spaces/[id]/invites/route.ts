import { NextResponse } from "next/server";
import { authorizeSpaceAccess } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorizeSpaceAccess(id, ["OWNER", "ADMIN"]);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { email, role = "MEMBER", expiresInDays = 7 } = await req.json();

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    const invitation = await prisma.invitation.create({
      data: {
        spaceId: id,
        inviterId: auth.user.id,
        token,
        email: email ? email.toLowerCase().trim() : null,
        role: ["ADMIN", "MEMBER"].includes(role) ? role : "MEMBER",
        expiresAt,
      },
    });

    return NextResponse.json({ invitation, inviteUrl: `/invites/${token}` });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorizeSpaceAccess(id, ["OWNER", "ADMIN"]);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const invitations = await prisma.invitation.findMany({
    where: { spaceId: id, acceptedAt: null, expiresAt: { gt: new Date() } },
    include: {
      inviter: { select: { displayName: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ invitations });
}
