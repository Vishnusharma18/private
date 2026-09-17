import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const album = await prisma.album.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
      albumMedia: {
        include: {
          media: true,
          user: { select: { id: true, displayName: true, username: true } },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const membership = await prisma.membership.findUnique({
    where: { spaceId_userId: { spaceId: album.spaceId, userId: session.id } },
  });

  if (!membership || membership.status !== "ACTIVE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ album });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const album = await prisma.album.findUnique({ where: { id } });
  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const membership = await prisma.membership.findUnique({
    where: { spaceId_userId: { spaceId: album.spaceId, userId: session.id } },
  });

  if (!membership || membership.status !== "ACTIVE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { mediaIds = [] } = await req.json();

    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json({ error: "No media IDs provided" }, { status: 400 });
    }

    const created = await prisma.albumMedia.createMany({
      data: mediaIds.map((mediaId: string) => ({
        albumId: id,
        mediaId,
        addedBy: session.id,
      })),
    });

    return NextResponse.json({ success: true, count: created.count });
  } catch (err) {
    return NextResponse.json({ error: "Failed to add media to album" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const album = await prisma.album.findUnique({ where: { id } });
  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const membership = await prisma.membership.findUnique({
    where: { spaceId_userId: { spaceId: album.spaceId, userId: session.id } },
  });

  if (!membership || membership.status !== "ACTIVE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isCreator = album.creatorId === session.id;
  const isManager = ["OWNER", "ADMIN"].includes(membership.role);

  if (!isCreator && !isManager) {
    return NextResponse.json({ error: "Not allowed to delete album" }, { status: 403 });
  }

  try {
    await prisma.album.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete album" }, { status: 500 });
  }
}
