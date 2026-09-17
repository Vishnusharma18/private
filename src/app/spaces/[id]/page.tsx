import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import SpaceNavigation from "./SpaceNavigation";
import SpaceFeed from "./SpaceFeed";

export default async function SpacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      spaceId_userId: {
        spaceId: id,
        userId: session.id,
      },
    },
    include: {
      space: true,
    },
  });

  if (!membership || membership.status !== "ACTIVE") {
    notFound();
  }

  const space = membership.space;

  const posts = await prisma.post.findMany({
    where: {
      spaceId: id,
      status: "PUBLISHED",
    },
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
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session} />

      {/* Header Banner */}
      <div className="bg-amber-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold">{space.name}</h1>
              {space.description && (
                <p className="text-amber-200 mt-1 max-w-2xl text-sm">{space.description}</p>
              )}
            </div>
            <div className="text-xs bg-amber-800/80 border border-amber-700 px-3 py-1.5 rounded-full uppercase tracking-wider font-semibold">
              Your Role: {membership.role}
            </div>
          </div>
        </div>
      </div>

      <SpaceNavigation spaceId={id} activeTab="timeline" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <SpaceFeed spaceId={id} initialPosts={posts} currentUserId={session.id} />
      </main>
    </div>
  );
}
