import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import SpaceNavigation from "../SpaceNavigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage({
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
          <h1 className="text-3xl font-extrabold">{membership.space.name} - Space Settings</h1>
        </div>
      </div>
      <SpaceNavigation spaceId={id} activeTab="settings" />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <SettingsClient
          space={membership.space}
          userRole={membership.role}
        />
      </main>
    </div>
  );
}
