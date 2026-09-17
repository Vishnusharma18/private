import { NextResponse } from "next/server";
import { authorizeSpaceAccess } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorizeSpaceAccess(id);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const events = await prisma.event.findMany({
    where: { spaceId: id },
    include: {
      creator: { select: { id: true, displayName: true, username: true } },
    },
    orderBy: { eventDate: "asc" },
  });

  return NextResponse.json({ events });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorizeSpaceAccess(id);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { title, description, eventDate, coverMediaId } = await req.json();

    if (!title || !title.trim() || !eventDate) {
      return NextResponse.json({ error: "Title and event date are required" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        spaceId: id,
        creatorId: auth.user.id,
        title: title.trim(),
        description: description ? description.trim() : null,
        eventDate: new Date(eventDate),
        coverMediaId: coverMediaId || null,
      },
      include: {
        creator: { select: { id: true, displayName: true, username: true } },
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
