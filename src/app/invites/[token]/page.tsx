"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Users, CheckCircle, AlertCircle } from "lucide-react";

export default function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    fetch(`/api/invites/${resolvedParams.token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setInvitation(data.invitation);
      })
      .catch(() => setError("Failed to load invitation."))
      .finally(() => setLoading(false));
  }, [resolvedParams.token]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const res = await fetch(`/api/invites/${resolvedParams.token}/accept`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?redirect=/invites/${resolvedParams.token}`);
        } else {
          setError(data.error || "Failed to accept invitation");
        }
      } else {
        router.push(`/spaces/${data.spaceId}`);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-xl shadow-md border border-gray-200 text-center">
        {loading ? (
          <p className="text-sm text-gray-500">Loading invitation...</p>
        ) : error ? (
          <div className="space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Invitation Invalid</h2>
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-800">
              <Users className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">You've Been Invited!</h2>
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-semibold text-gray-900">{invitation.inviter?.displayName}</span> has invited you to join:
              </p>
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="text-lg font-bold text-amber-950">{invitation.space?.name}</h3>
                {invitation.space?.description && (
                  <p className="text-xs text-amber-800 mt-1">{invitation.space.description}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow disabled:opacity-50"
            >
              {accepting ? "Joining..." : "Accept Invitation & Join"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
