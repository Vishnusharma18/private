import { NextResponse } from "next/server";
import { authorizeSpaceAccess } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  const auth = await authorizeSpaceAccess(id, ["OWNER", "ADMIN"]);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { role } = await req.json();
    if (!["ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    const targetMembership = await prisma.membership.findUnique({
      where: { spaceId_userId: { spaceId: id, userId } },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: "Member not found in space" }, { status: 404 });
    }

    if (targetMembership.role === "OWNER") {
      return NextResponse.json({ error: "Cannot change the owner's role" }, { status: 403 });
    }

    if (auth.membership.role !== "OWNER" && targetMembership.role === "ADMIN") {
      return NextResponse.json({ error: "Only the owner can demote an admin" }, { status: 403 });
    }

    const updated = await prisma.membership.update({
      where: { id: targetMembership.id },
      data: { role },
    });

    return NextResponse.json({ membership: updated });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update member role" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  const auth = await authorizeSpaceAccess(id);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const isSelf = auth.user.id === userId;
  const isManager = ["OWNER", "ADMIN"].includes(auth.membership.role);

  if (!isSelf && !isManager) {
    return NextResponse.json({ error: "You are not allowed to remove this member" }, { status: 403 });
  }

  try {
    const targetMembership = await prisma.membership.findUnique({
      where: { spaceId_userId: { spaceId: id, userId } },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: "Member not found in space" }, { status: 404 });
    }

    if (targetMembership.role === "OWNER") {
      return NextResponse.json({ error: "The space owner cannot leave or be removed without deleting the space or transferring ownership." }, { status: 400 });
    }

    await prisma.membership.delete({
      where: { id: targetMembership.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
