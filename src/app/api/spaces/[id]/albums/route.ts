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

  const albums = await prisma.album.findMany({
    where: { spaceId: id },
    include: {
      creator: { select: { id: true, displayName: true, username: true } },
      _count: { select: { albumMedia: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ albums });
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
    const { name, description, coverMediaId } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Album name is required" }, { status: 400 });
    }

    const album = await prisma.album.create({
      data: {
        spaceId: id,
        creatorId: auth.user.id,
        name: name.trim(),
        description: description ? description.trim() : null,
        coverMediaId: coverMediaId || null,
      },
      include: {
        creator: { select: { id: true, displayName: true, username: true } },
      },
    });

    return NextResponse.json({ album }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create album" }, { status: 500 });
  }
}
