import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session} />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">User Profile Settings</h1>
        <ProfileClient user={session} />
      </main>
    </div>
  );
}
