"use client";

import { useState } from "react";
import { Plus, Image as ImageIcon, X, Upload } from "lucide-react";

export default function AlbumsClient({
  spaceId,
  initialAlbums,
}: {
  spaceId: string;
  initialAlbums: any[];
}) {
  const [albums, setAlbums] = useState<any[]>(initialAlbums);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    let coverMediaId: string | undefined = undefined;

    try {
      if (coverFile) {
        const formData = new FormData();
        formData.append("file", coverFile);
        formData.append("spaceId", spaceId);

        const uploadRes = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          coverMediaId = uploadData.media.id;
        }
      }

      const res = await fetch(`/api/spaces/${spaceId}/albums`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, coverMediaId }),
      });

      if (res.ok) {
        const data = await res.json();
        setAlbums([data.album, ...albums]);
        setName("");
        setDescription("");
        setCoverFile(null);
        setCoverPreview(null);
        setOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Shared Photo & Video Albums</h2>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-lg shadow"
        >
          <Plus className="w-4 h-4" />
          <span>New Album</span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Album</h3>
            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Album Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 font-medium focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g. Summer Beach Party"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 font-medium focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Album details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Album Cover Photo</label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 p-4 rounded-lg cursor-pointer hover:border-amber-500 transition">
                  <Upload className="w-5 h-5 text-amber-600" />
                  <span className="text-xs text-gray-700 font-medium">
                    {coverFile ? coverFile.name : "Select Album Cover Photo"}
                  </span>
                  <input type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
                </label>
                {coverPreview && (
                  <div className="mt-2 h-28 rounded-lg overflow-hidden border">
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700"
                >
                  {loading ? "Creating..." : "Create Album"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {albums.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 text-gray-500">
          <ImageIcon className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p>No albums created in this space yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <div key={album.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="h-40 bg-amber-100 flex items-center justify-center text-amber-700 relative overflow-hidden">
                {album.coverMediaId ? (
                  <img src={`/api/media/${album.coverMediaId}`} alt={album.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-12 h-12" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{album.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{album.description || "No description."}</p>
                <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-2">
                  <span>Created by {album.creator?.displayName}</span>
                  <span>{album.albumMedia?.length || 0} media</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
