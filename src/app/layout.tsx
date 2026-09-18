import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FriendsJournal - Private Friends Memory Platform",
  description: "A private, collaborative web space for friend groups to preserve photos, stories, events, and memories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
