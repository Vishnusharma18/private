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

  const members = await prisma.membership.findMany({
    where: { spaceId: id, status: "ACTIVE" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          username: true,
          avatarUrl: true,
          bio: true,
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json({ members, currentUserRole: auth.membership.role });
}
