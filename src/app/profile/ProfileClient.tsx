"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, AlertTriangle } from "lucide-react";

export default function ProfileClient({ user }: { user: any }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErr("");

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, username, bio }),
      });

      const data = await res.json();
      if (res.ok) {
        setMsg("Profile updated successfully!");
        router.refresh();
      } else {
        setErr(data.error || "Failed to update profile.");
      }
    } catch {
      setErr("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you SURE you want to delete your account? This action cannot be undone.")) return;

    try {
      const res = await fetch("/api/users/account", { method: "DELETE" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch {
      setErr("Failed to delete account.");
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        {msg && <div className="p-3 text-xs bg-green-50 text-green-700 border border-green-200 rounded">{msg}</div>}
        {err && <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded">{err}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            disabled
            value={user.email}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-100 text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500"
            placeholder="Tell your friends a bit about yourself..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-md shadow"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>

      <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm space-y-3">
        <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span>Delete Account</span>
        </h3>
        <p className="text-xs text-red-700">
          Deleting your account will remove your profile and access to all private spaces.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md shadow"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
