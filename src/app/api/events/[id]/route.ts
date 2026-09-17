import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const membership = await prisma.membership.findUnique({
    where: { spaceId_userId: { spaceId: event.spaceId, userId: session.id } },
  });

  if (!membership || membership.status !== "ACTIVE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isCreator = event.creatorId === session.id;
  const isManager = ["OWNER", "ADMIN"].includes(membership.role);

  if (!isCreator && !isManager) {
    return NextResponse.json({ error: "Not allowed to delete event" }, { status: 403 });
  }

  try {
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
