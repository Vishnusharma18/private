import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import CreateSpaceButton from "./CreateSpaceButton";
import { Users, BookOpen, Calendar, Image as ImageIcon } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const memberships = await prisma.membership.findMany({
    where: { userId: session.id, status: "ACTIVE" },
    include: {
      space: {
        include: {
          _count: {
            select: { memberships: true, posts: true, albums: true, events: true },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Spaces</h1>
            <p className="text-gray-600 text-sm mt-1">
              Private journal circles shared with your close friends.
            </p>
          </div>
          <CreateSpaceButton />
        </div>

        {memberships.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-300 max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Private Spaces Yet</h3>
            <p className="text-sm text-gray-500 mb-6">
              Create your first private space or ask a friend to send you an invitation link!
            </p>
            <CreateSpaceButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberships.map(({ space, role }) => (
              <Link
                key={space.id}
                href={`/spaces/${space.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-amber-300 transition duration-150 overflow-hidden group"
              >
                <div className="h-32 bg-amber-100 relative p-4 flex flex-col justify-end">
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                    {role}
                  </div>
                  <h2 className="text-xl font-bold text-amber-950 group-hover:text-amber-700 transition">
                    {space.name}
                  </h2>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">
                    {space.description || "No description set for this space."}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {space._count.memberships} members
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {space._count.posts} posts
                    </span>
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      {space._count.albums} albums
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
