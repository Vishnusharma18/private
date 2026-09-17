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

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type"); // MEMORY, STORY, EVENT, ALBUM
  const authorId = searchParams.get("authorId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const postWhere: any = {
    spaceId: id,
    status: "PUBLISHED",
  };

  if (type && ["MEMORY", "STORY"].includes(type)) {
    postWhere.type = type;
  }
  if (authorId) postWhere.authorId = authorId;
  if (from || to) {
    postWhere.createdAt = {};
    if (from) postWhere.createdAt.gte = new Date(from);
    if (to) postWhere.createdAt.lte = new Date(to);
  }
  if (q.trim()) {
    postWhere.OR = [
      { title: { contains: q.trim() } },
      { content: { contains: q.trim() } },
    ];
  }

  const posts = await prisma.post.findMany({
    where: postWhere,
    include: {
      author: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
      postMedia: { include: { media: true } },
      _count: { select: { comments: true, reactions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const albums = await prisma.album.findMany({
    where: {
      spaceId: id,
      ...(q.trim() ? { name: { contains: q.trim() } } : {}),
      ...(authorId ? { creatorId: authorId } : {}),
    },
    include: {
      creator: { select: { id: true, displayName: true, username: true } },
      _count: { select: { albumMedia: true } },
    },
  });

  const events = await prisma.event.findMany({
    where: {
      spaceId: id,
      ...(q.trim() ? { title: { contains: q.trim() } } : {}),
      ...(authorId ? { creatorId: authorId } : {}),
    },
    include: {
      creator: { select: { id: true, displayName: true, username: true } },
    },
  });

  return NextResponse.json({ posts, albums, events });
}
