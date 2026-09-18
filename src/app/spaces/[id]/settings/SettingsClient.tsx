"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2, AlertTriangle } from "lucide-react";

export default function SettingsClient({
  space,
  userRole,
}: {
  space: any;
  userRole: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(space.name);
  const [description, setDescription] = useState(space.description || "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const canManage = ["OWNER", "ADMIN"].includes(userRole);
  const isOwner = userRole === "OWNER";

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErr("");

    try {
      const res = await fetch(`/api/spaces/${space.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        setMsg("Space settings updated successfully.");
      } else {
        const data = await res.json();
        setErr(data.error || "Failed to update space.");
      }
    } catch {
      setErr("Failed to update space.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpace = async () => {
    if (!confirm("Are you SURE you want to delete this space? All memories, stories, and comments will be permanently erased.")) return;

    try {
      const res = await fetch(`/api/spaces/${space.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setErr("Failed to delete space.");
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleUpdate} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Space Profile</h3>

        {msg && <div className="p-3 text-xs bg-green-50 text-green-700 border border-green-200 rounded">{msg}</div>}
        {err && <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded">{err}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Space Name</label>
          <input
            type="text"
            required
            disabled={!canManage}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3}
            disabled={!canManage}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        {canManage && (
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-md shadow"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        )}
      </form>

      {isOwner && (
        <div className="bg-red-50 rounded-xl p-6 border border-red-200 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Danger Zone</span>
          </h3>
          <p className="text-xs text-red-700">
            Deleting this space will permanently remove all shared posts, stories, albums, and media for all members.
          </p>
          <button
            onClick={handleDeleteSpace}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md shadow"
          >
            Delete Space Permanently
          </button>
        </div>
      )}
    </div>
  );
}
