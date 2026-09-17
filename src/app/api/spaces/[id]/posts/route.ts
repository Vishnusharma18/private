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
  const type = searchParams.get("type"); // MEMORY or STORY
  const authorId = searchParams.get("authorId");
  const query = searchParams.get("q");

  const where: any = {
    spaceId: id,
    status: "PUBLISHED",
  };

  if (type) where.type = type;
  if (authorId) where.authorId = authorId;
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { content: { contains: query } },
    ];
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: {
        select: { id: true, displayName: true, username: true, avatarUrl: true },
      },
      postMedia: {
        include: { media: true },
        orderBy: { sortOrder: "asc" },
      },
      comments: {
        include: {
          author: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      reactions: {
        include: {
          user: { select: { id: true, displayName: true, username: true } },
        },
      },
      _count: {
        select: { comments: true, reactions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ posts });
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
    const { type = "MEMORY", title, content, status = "PUBLISHED", mediaIds = [] } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Post content is required" }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        spaceId: id,
        authorId: auth.user.id,
        type: ["MEMORY", "STORY"].includes(type) ? type : "MEMORY",
        title: title ? title.trim() : null,
        content: content.trim(),
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        postMedia: {
          create: mediaIds.map((mediaId: string, idx: number) => ({
            mediaId,
            sortOrder: idx,
          })),
        },
      },
      include: {
        author: {
          select: { id: true, displayName: true, username: true, avatarUrl: true },
        },
        postMedia: {
          include: { media: true },
        },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error("Create post error:", err);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
