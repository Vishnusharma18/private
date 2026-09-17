"use client";

import { useState } from "react";
import { Search as SearchIcon, Calendar, BookOpen, Image as ImageIcon } from "lucide-react";

export default function SearchClient({ spaceId }: { spaceId: string }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [results, setResults] = useState<any>({ posts: [], albums: [], events: [] });
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = `/api/spaces/${spaceId}/search?q=${encodeURIComponent(query)}&type=${type}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setSearched(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search memories, stories, title or text..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium shadow"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="flex gap-4 text-xs font-medium text-gray-600">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="type"
              value=""
              checked={type === ""}
              onChange={() => setType("")}
              className="text-amber-600"
            />
            <span>All Types</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="MEMORY"
              checked={type === "MEMORY"}
              onChange={() => setType("MEMORY")}
              className="text-amber-600"
            />
            <span>Memories</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="STORY"
              checked={type === "STORY"}
              onChange={() => setType("STORY")}
              className="text-amber-600"
            />
            <span>Stories / Blogs</span>
          </label>
        </div>
      </form>

      {searched && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900">
            Results ({results.posts?.length || 0} posts, {results.albums?.length || 0} albums, {results.events?.length || 0} events)
          </h3>

          <div className="space-y-4">
            {results.posts?.map((post: any) => (
              <div key={post.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="font-bold text-amber-800">{post.type}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                {post.title && <h4 className="font-bold text-gray-900 text-md mb-1">{post.title}</h4>}
                <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
                <div className="text-xs text-gray-400 mt-3">By {post.author?.displayName}</div>
              </div>
            ))}

            {results.posts?.length === 0 && results.albums?.length === 0 && results.events?.length === 0 && (
              <p className="text-center py-8 text-sm text-gray-500 bg-white rounded-xl border">No matching results found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
