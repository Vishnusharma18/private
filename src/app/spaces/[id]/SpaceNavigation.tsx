"use client";

import Link from "next/link";
import { BookOpen, Image as ImageIcon, Calendar, Users, Search, Settings } from "lucide-react";

export default function SpaceNavigation({
  spaceId,
  activeTab,
}: {
  spaceId: string;
  activeTab: "timeline" | "albums" | "events" | "members" | "search" | "settings";
}) {
  const tabs = [
    { id: "timeline", label: "Timeline", href: `/spaces/${spaceId}`, icon: BookOpen },
    { id: "albums", label: "Albums", href: `/spaces/${spaceId}/albums`, icon: ImageIcon },
    { id: "events", label: "Events", href: `/spaces/${spaceId}/events`, icon: Calendar },
    { id: "members", label: "Members", href: `/spaces/${spaceId}/members`, icon: Users },
    { id: "search", label: "Search", href: `/spaces/${spaceId}/search`, icon: Search },
    { id: "settings", label: "Settings", href: `/spaces/${spaceId}/settings`, icon: Settings },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center space-x-2 py-4 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                isActive
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
