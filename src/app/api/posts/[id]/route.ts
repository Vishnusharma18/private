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

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      space: true,
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
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Membership check
  const membership = await prisma.membership.findUnique({
    where: {
      spaceId_userId: {
        spaceId: post.spaceId,
        userId: session.id,
      },
    },
  });

  if (!membership || membership.status !== "ACTIVE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ post, currentUserRole: membership.role });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const membership = await prisma.membership.findUnique({
    where: {
      spaceId_userId: {
        spaceId: post.spaceId,
        userId: session.id,
      },
    },
  });

  if (!membership || membership.status !== "ACTIVE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isAuthor = post.authorId === session.id;
  const isManager = ["OWNER", "ADMIN"].includes(membership.role);

  if (!isAuthor && !isManager) {
    return NextResponse.json({ error: "Not allowed to edit post" }, { status: 403 });
  }

  try {
    const { title, content, status } = await req.json();

    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({ post: updated });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
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

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const membership = await prisma.membership.findUnique({
    where: {
      spaceId_userId: {
        spaceId: post.spaceId,
        userId: session.id,
      },
    },
  });

  if (!membership || membership.status !== "ACTIVE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isAuthor = post.authorId === session.id;
  const isManager = ["OWNER", "ADMIN"].includes(membership.role);

  if (!isAuthor && !isManager) {
    return NextResponse.json({ error: "Not allowed to delete post" }, { status: 403 });
  }

  try {
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
