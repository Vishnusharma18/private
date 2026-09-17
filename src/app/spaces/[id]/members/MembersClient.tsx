"use client";

import { useState } from "react";
import { UserPlus, Shield, Trash2, Copy, Check, Link as LinkIcon } from "lucide-react";

export default function MembersClient({
  spaceId,
  initialMembers,
  currentUserRole,
  currentUserId,
}: {
  spaceId: string;
  initialMembers: any[];
  currentUserRole: string;
  currentUserId: string;
}) {
  const [members, setMembers] = useState<any[]>(initialMembers);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const canManage = ["OWNER", "ADMIN"].includes(currentUserRole);

  const handleGenerateInvite = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "MEMBER" }),
      });

      if (res.ok) {
        const data = await res.json();
        const fullUrl = `${window.location.origin}${data.inviteUrl}`;
        setInviteUrl(fullUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const res = await fetch(`/api/spaces/${spaceId}/members/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMembers(members.filter((m) => m.userId !== userId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Invite Generation Card */}
      {canManage && (
        <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-600" />
            <span>Invite Friends to Space</span>
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            Generate a private invitation link. Anyone with this link can join this space.
          </p>

          {!inviteUrl ? (
            <button
              onClick={handleGenerateInvite}
              disabled={loading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium shadow disabled:opacity-50"
            >
              {loading ? "Generating Link..." : "Generate Invitation Link"}
            </button>
          ) : (
            <div className="flex items-center gap-2 max-w-lg">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 px-3 py-2 border rounded-md text-xs bg-gray-50 text-gray-700 font-mono"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-amber-600 text-white rounded-md text-xs font-medium flex items-center gap-1 hover:bg-amber-700"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Space Members ({members.length})</h3>

        <div className="divide-y divide-gray-100">
          {members.map(({ id, user, role }) => (
            <div key={id} className="py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm border border-amber-200">
                  {user.displayName?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{user.displayName}</h4>
                  <p className="text-xs text-gray-500">@{user.username} • {user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  role === "OWNER"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : role === "ADMIN"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {role}
                </span>

                {canManage && role !== "OWNER" && user.id !== currentUserId && (
                  <button
                    onClick={() => handleRemoveMember(user.id)}
                    className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-gray-50"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
