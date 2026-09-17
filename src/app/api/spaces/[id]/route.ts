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

  const space = await prisma.space.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, displayName: true, username: true, avatarUrl: true },
      },
      _count: {
        select: {
          memberships: true,
          posts: true,
          albums: true,
          events: true,
        },
      },
    },
  });

  return NextResponse.json({ space, userRole: auth.membership.role });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorizeSpaceAccess(id, ["OWNER", "ADMIN"]);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { name, description, coverUrl } = await req.json();

    const space = await prisma.space.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(coverUrl !== undefined && { coverUrl }),
      },
    });

    return NextResponse.json({ space });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update space" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorizeSpaceAccess(id, ["OWNER"]);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await prisma.space.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete space" }, { status: 500 });
  }
}
