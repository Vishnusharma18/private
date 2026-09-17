import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type = "LIKE" } = await req.json();

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

  // Toggle or add reaction
  const existing = await prisma.reaction.findUnique({
    where: {
      postId_userId_type: {
        postId,
        userId: session.id,
        type,
      },
    },
  });

  if (existing) {
    // Remove if toggled
    await prisma.reaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ action: "removed" });
  } else {
    const reaction = await prisma.reaction.create({
      data: {
        postId,
        userId: session.id,
        type,
      },
      include: {
        user: { select: { id: true, displayName: true, username: true } },
      },
    });

    if (post.authorId !== session.id) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          actorId: session.id,
          type: "REACTION",
          entityType: "POST",
          entityId: postId,
        },
      });
    }

    return NextResponse.json({ action: "added", reaction }, { status: 201 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "LIKE";

  try {
    await prisma.reaction.deleteMany({
      where: {
        postId,
        userId: session.id,
        type,
      },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to remove reaction" }, { status: 500 });
  }
}
