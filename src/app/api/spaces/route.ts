import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await prisma.membership.findMany({
    where: {
      userId: session.id,
      status: "ACTIVE",
    },
    include: {
      space: {
        include: {
          _count: {
            select: {
              memberships: true,
              posts: true,
              albums: true,
              events: true,
            },
          },
        },
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  const spaces = memberships.map((m) => ({
    ...m.space,
    role: m.role,
    joinedAt: m.joinedAt,
  }));

  return NextResponse.json({ spaces });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, coverUrl } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Space name is required" }, { status: 400 });
    }

    const space = await prisma.$transaction(async (tx) => {
      const newSpace = await tx.space.create({
        data: {
          name: name.trim(),
          description: description ? description.trim() : null,
          coverUrl: coverUrl || null,
          ownerId: session.id,
        },
      });

      await tx.membership.create({
        data: {
          spaceId: newSpace.id,
          userId: session.id,
          role: "OWNER",
          status: "ACTIVE",
        },
      });

      return newSpace;
    });

    return NextResponse.json({ space }, { status: 201 });
  } catch (err: any) {
    console.error("Create space error:", err);
    return NextResponse.json({ error: "Failed to create space" }, { status: 500 });
  }
}
