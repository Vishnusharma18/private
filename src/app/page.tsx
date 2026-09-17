import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookOpen, ShieldCheck, Heart, Users, Sparkles, Image as ImageIcon } from "lucide-react";

export default async function LandingPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-amber-50/30">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Private Friends Memory & Life Journal</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-950 tracking-tight max-w-4xl mx-auto leading-tight">
          A persistent digital home for your close friend group.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Preserve photos, videos, stories, blogs, and events in one private chronological feed built exclusively for your friends.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-base rounded-lg shadow-md transition"
          >
            Create Your Private Space
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold text-base rounded-lg shadow-sm transition"
          >
            Log In
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-amber-100 shadow-sm">
          <ShieldCheck className="w-10 h-10 text-amber-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Private by Default</h3>
          <p className="text-sm text-gray-600">
            No public feeds, search engines, or algorithms. Only invited members can view or contribute.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-amber-100 shadow-sm">
          <BookOpen className="w-10 h-10 text-amber-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Memories & Long Stories</h3>
          <p className="text-sm text-gray-600">
            Share quick trip photos or write rich long-form story posts to preserve your journey together.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-amber-100 shadow-sm">
          <ImageIcon className="w-10 h-10 text-amber-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Albums & Group Events</h3>
          <p className="text-sm text-gray-600">
            Organize roadtrip photos into shared albums and log upcoming or past group gatherings.
          </p>
        </div>
      </section>
    </div>
  );
}
