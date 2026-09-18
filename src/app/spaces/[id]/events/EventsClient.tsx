"use client";

import { useState } from "react";
import { Calendar, Plus, X } from "lucide-react";

export default function EventsClient({
  spaceId,
  initialEvents,
}: {
  spaceId: string;
  initialEvents: any[];
}) {
  const [events, setEvents] = useState<any[]>(initialEvents);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, eventDate }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvents([...events, data.event]);
        setTitle("");
        setDescription("");
        setEventDate("");
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
        <h2 className="text-2xl font-bold text-gray-900">Upcoming & Past Events</h2>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-lg shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Group Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 font-medium focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g. Annual Cabin Trip"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white font-medium focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 font-medium focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Details, location, plans..."
                />
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium"
                >
                  {loading ? "Adding..." : "Add Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 text-gray-500">
          <Calendar className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p>No events scheduled for this space.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl p-5 border border-gray-200 flex items-start gap-4 shadow-sm">
              <div className="bg-amber-100 text-amber-900 px-4 py-3 rounded-lg text-center font-bold min-w-[70px]">
                <div className="text-xs uppercase">{new Date(event.eventDate).toLocaleString("default", { month: "short" })}</div>
                <div className="text-2xl">{new Date(event.eventDate).getDate()}</div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{event.description || "No description provided."}</p>
                <div className="text-xs text-gray-400 mt-2">Added by {event.creator?.displayName}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
