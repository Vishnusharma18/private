"use client";

import { useState } from "react";
import { Heart, MessageCircle, Image as ImageIcon, Send, Trash2, Edit3, Plus, FileText } from "lucide-react";

export default function SpaceFeed({
  spaceId,
  initialPosts,
  currentUserId,
}: {
  spaceId: string;
  initialPosts: any[];
  currentUserId: string;
}) {
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [postType, setPostType] = useState<"MEMORY" | "STORY">("MEMORY");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setUploading(true);
    let mediaIds: string[] = [];

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("spaceId", spaceId);

        const uploadRes = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          mediaIds.push(uploadData.media.id);
        }
      }

      const res = await fetch(`/api/spaces/${spaceId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: postType,
          title: postType === "STORY" ? title : undefined,
          content,
          mediaIds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts([data.post, ...posts]);
        setContent("");
        setTitle("");
        setSelectedFile(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleReaction = async (postId: string, type: string = "HEART") => {
    try {
      const res = await fetch(`/api/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (res.ok) {
        // Refresh posts list
        const refresh = await fetch(`/api/spaces/${spaceId}/posts`);
        if (refresh.ok) {
          const data = await refresh.json();
          setPosts(data.posts);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentBody = commentInputs[postId];
    if (!commentBody || !commentBody.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentBody }),
      });

      if (res.ok) {
        setCommentInputs({ ...commentInputs, [postId]: "" });
        const refresh = await fetch(`/api/spaces/${spaceId}/posts`);
        if (refresh.ok) {
          const data = await refresh.json();
          setPosts(data.posts);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Post Creation Box */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex border-b border-gray-100 pb-3 mb-4 gap-4">
          <button
            onClick={() => setPostType("MEMORY")}
            className={`flex items-center space-x-1.5 text-sm font-medium pb-2 border-b-2 transition ${
              postType === "MEMORY"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </button>
          <button
            onClick={() => setPostType("STORY")}
            className={`flex items-center space-x-1.5 text-sm font-medium pb-2 border-b-2 transition ${
              postType === "STORY"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Write Story / Blog</span>
          </button>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-4">
          {postType === "STORY" && (
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Story Title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-semibold focus:ring-amber-500 focus:border-amber-500"
            />
          )}

          <textarea
            rows={postType === "STORY" ? 5 : 3}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              postType === "MEMORY"
                ? "Share a moment, thought, or photo with the space..."
                : "Write your blog post or long-form story..."
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-600 hover:text-amber-700 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <span>{selectedFile ? selectedFile.name : "Attach Photo/Video"}</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-md shadow disabled:opacity-50"
            >
              {uploading ? "Publishing..." : "Publish"}
            </button>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
            No memories or stories shared yet. Be the first to share one!
          </div>
        ) : (
          posts.map((post) => {
            const isUserReacted = post.reactions?.some((r: any) => r.userId === currentUserId);

            return (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-800">
                      {post.author?.displayName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{post.author?.displayName}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.type === "STORY" && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Story
                      </span>
                    )}

                    {(post.authorId === currentUserId) && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {post.title && (
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                )}

                <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed mb-4">
                  {post.content}
                </p>

                {/* Media Attachments */}
                {post.postMedia?.length > 0 && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 max-h-96 bg-black flex items-center justify-center">
                    {post.postMedia[0].media.type === "VIDEO" ? (
                      <video
                        controls
                        src={post.postMedia[0].media.url}
                        className="max-h-96 w-full object-contain"
                      />
                    ) : (
                      <img
                        src={post.postMedia[0].media.url}
                        alt="Memory media"
                        className="max-h-96 w-full object-contain"
                      />
                    )}
                  </div>
                )}

                {/* Social Actions */}
                <div className="flex items-center gap-6 py-3 border-t border-b border-gray-100 text-xs font-medium text-gray-600">
                  <button
                    onClick={() => handleToggleReaction(post.id)}
                    className={`flex items-center gap-1.5 transition ${
                      isUserReacted ? "text-red-600 font-bold" : "hover:text-red-600"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isUserReacted ? "fill-red-600 text-red-600" : ""}`} />
                    <span>{post.reactions?.length || 0} Likes</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments?.length || 0} Comments</span>
                  </div>
                </div>

                {/* Comments List */}
                <div className="mt-4 space-y-3">
                  {post.comments?.map((comment: any) => (
                    <div key={comment.id} className="bg-gray-50 p-3 rounded-lg text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900">{comment.author?.displayName}</span>
                        <span className="text-gray-400">
                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.body}</p>
                    </div>
                  ))}

                  {/* Add Comment Input */}
                  <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInputs[post.id] || ""}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-amber-500 focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-medium flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
