import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import SpaceNavigation from "../SpaceNavigation";
import SearchClient from "./SearchClient";

export default async function SearchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session) redirect("/login");

  const membership = await prisma.membership.findUnique({
    where: { spaceId_userId: { spaceId: id, userId: session.id } },
    include: { space: true },
  });

  if (!membership || membership.status !== "ACTIVE") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session} />
      <div className="bg-amber-900 text-white py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold">{membership.space.name} - Search</h1>
        </div>
      </div>
      <SpaceNavigation spaceId={id} activeTab="search" />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <SearchClient spaceId={id} />
      </main>
    </div>
  );
}
