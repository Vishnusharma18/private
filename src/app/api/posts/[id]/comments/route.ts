import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const membership = await prisma.membership.findUnique({
    where: { spaceId_userId: { spaceId: post.spaceId, userId: session.id } },
  });

  if (!membership || membership.status !== "ACTIVE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      author: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ comments });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { body } = await req.json();
  if (!body || !body.trim()) {
    return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const membership = await prisma.membership.findUnique({
    where: { spaceId_userId: { spaceId: post.spaceId, userId: session.id } },
  });

  if (!membership || membership.status !== "ACTIVE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      authorId: session.id,
      body: body.trim(),
    },
    include: {
      author: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
    },
  });

  // Create notification for post author if commenter is not post author
  if (post.authorId !== session.id) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        actorId: session.id,
        type: "COMMENT",
        entityType: "POST",
        entityId: postId,
      },
    });
  }

  return NextResponse.json({ comment }, { status: 201 });
}
