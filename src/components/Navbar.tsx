"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { BookOpen, User, LogOut, Bell, Plus, Compass } from "lucide-react";

export default function Navbar({ user }: { user?: any }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (data.notifications) setNotifications(data.notifications);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markRead = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications(notifications.map((n) => ({ ...n, readAt: new Date() })));
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2 font-bold text-xl text-amber-700">
          <BookOpen className="w-6 h-6 text-amber-600" />
          <span>FriendsJournal</span>
        </Link>

        {user ? (
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-amber-700 font-medium flex items-center space-x-1"
            >
              <Compass className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={markRead}
                className="relative p-2 text-gray-600 hover:text-amber-700 rounded-full hover:bg-gray-100 transition"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-xl rounded-lg py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 font-semibold text-sm border-b text-gray-700">Notifications</div>
                  {notifications.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="px-4 py-2 hover:bg-gray-50 text-xs text-gray-700 border-b border-gray-100">
                        <span className="font-semibold">{n.actor?.displayName || "Someone"}</span>{" "}
                        {n.type === "COMMENT" ? "commented on your post" : n.type === "REACTION" ? "reacted to your post" : "sent an invitation"}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <Link
              href="/profile"
              className="flex items-center space-x-2 text-sm text-gray-700 hover:text-amber-700 font-medium"
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold border border-amber-300">
                {user.displayName?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="hidden sm:inline">{user.displayName}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 rounded-md hover:bg-gray-100 transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-amber-700"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-sm"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
