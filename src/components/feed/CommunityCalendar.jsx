import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, CalendarDays, List, MapPin, Clock, CheckCircle2, Bell, BellOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, isToday, parseISO, addMonths, subMonths, addWeeks, subWeeks, startOfWeek as sowFn, endOfWeek as eowFn } from "date-fns";
import { toast } from "sonner";

// Parse event date/time from post content (injected by EventFields formatter)
function parseEventFromPost(post) {
  const dateMatch = post.content.match(/📅 Date: (\d{4}-\d{2}-\d{2})(?:\s+at\s+(\d{2}:\d{2}))?/);
  const locationMatch = post.content.match(/📍 Location: (.+)/);
  const rsvpMatch = post.content.match(/🔗 RSVP: (.+)/);
  const titleLine = post.content.split("\n")[0];
  return {
    ...post,
    event_date: dateMatch ? dateMatch[1] : null,
    event_time: dateMatch ? dateMatch[2] || null : null,
    event_location: locationMatch ? locationMatch[1].trim() : null,
    event_rsvp_url: rsvpMatch ? rsvpMatch[1].trim() : null,
    event_title: titleLine.slice(0, 80),
  };
}

function EventDot({ count }) {
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-bold">{count}</span>
  );
}

function EventCard({ event, rsvps, currentUser, onRsvpToggle }) {
  const isRsvped = rsvps.some(r => r.post_id === event.id && r.user_email === currentUser?.email);
  const rsvpCount = rsvps.filter(r => r.post_id === event.id).length;

  return (
    <div className="bg-white border rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 line-clamp-2">{event.event_title}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
            {event.event_date && (
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3 text-pink-500" />
                {format(parseISO(event.event_date), "MMM d, yyyy")}
                {event.event_time && ` at ${event.event_time}`}
              </span>
            )}
            {event.event_location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-green-600" />
                <span className="truncate max-w-[150px]">{event.event_location}</span>
              </span>
            )}
          </div>
          {rsvpCount > 0 && (
            <p className="text-xs text-gray-400 mt-1">✅ {rsvpCount} {rsvpCount === 1 ? "person" : "people"} going</p>
          )}
        </div>
        {currentUser && (
          <Button
            size="sm"
            variant={isRsvped ? "default" : "outline"}
            className={`shrink-0 h-8 text-xs ${isRsvped ? "bg-green-700 hover:bg-green-800 text-white" : "border-green-300 text-green-700 hover:bg-green-50"}`}
            onClick={() => onRsvpToggle(event, isRsvped)}
          >
            {isRsvped ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Going</> : "RSVP"}
          </Button>
        )}
      </div>
      {event.event_rsvp_url && (
        <a href={event.event_rsvp_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
          External RSVP link →
        </a>
      )}
    </div>
  );
}

export default function CommunityCalendar({ currentUser }) {
  const qc = useQueryClient();
  const [viewMode, setViewMode] = useState("month"); // month | week | list
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const { data: rawPosts = [] } = useQuery({
    queryKey: ["event-posts"],
    queryFn: () => base44.entities.Post.filter({ category: "Event", is_published: true }, "-created_date", 200),
  });

  const { data: rsvps = [] } = useQuery({
    queryKey: ["rsvps"],
    queryFn: () => base44.entities.RSVP.list("-created_date", 500),
  });

  const events = useMemo(() => rawPosts.map(parseEventFromPost).filter(e => e.event_date), [rawPosts]);

  const rsvpMutation = useMutation({
    mutationFn: async ({ event, isRsvped }) => {
      if (isRsvped) {
        const existing = rsvps.find(r => r.post_id === event.id && r.user_email === currentUser.email);
        if (existing) await base44.entities.RSVP.delete(existing.id);
      } else {
        await base44.entities.RSVP.create({
          post_id: event.id,
          user_email: currentUser.email,
          user_name: currentUser.full_name || currentUser.email.split("@")[0],
          event_title: event.event_title,
          event_date: event.event_date,
        });
      }
    },
    onSuccess: (_, { isRsvped, event }) => {
      qc.invalidateQueries({ queryKey: ["rsvps"] });
      toast.success(isRsvped ? "RSVP removed" : `You're going to "${event.event_title}"! 🎉`);
    },
  });

  // Calendar grid days
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridDays = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });

  const weekStart = sowFn(cursor);
  const weekEnd = eowFn(cursor);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const eventsForDay = (day) => events.filter(e => isSameDay(parseISO(e.event_date), day));

  const selectedDayEvents = selectedDay ? eventsForDay(selectedDay) : [];

  // Upcoming events for list view
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingEvents = [...events]
    .filter(e => new Date(e.event_date) >= today)
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  const myRsvps = events.filter(e => rsvps.some(r => r.post_id === e.id && r.user_email === currentUser?.email));

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-pink-500" />
          <h2 className="font-bold text-gray-900">Community Calendar</h2>
          {myRsvps.length > 0 && (
            <Badge className="bg-green-100 text-green-700 text-xs">{myRsvps.length} RSVPs</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {["month", "week", "list"].map(m => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`text-xs px-3 py-1 rounded-full border capitalize transition-colors ${viewMode === m ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"}`}
            >
              {m === "month" ? "Month" : m === "week" ? "Week" : <span className="flex items-center gap-1"><List className="w-3 h-3 inline" /> List</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Month / Week nav */}
      {viewMode !== "list" && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
          <button onClick={() => viewMode === "month" ? setCursor(subMonths(cursor, 1)) : setCursor(subWeeks(cursor, 1))}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="font-semibold text-sm text-gray-800">
            {viewMode === "month" ? format(cursor, "MMMM yyyy") : `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`}
          </span>
          <button onClick={() => viewMode === "month" ? setCursor(addMonths(cursor, 1)) : setCursor(addWeeks(cursor, 1))}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      {/* Month grid */}
      {viewMode === "month" && (
        <div>
          <div className="grid grid-cols-7 border-b">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {gridDays.map((day, i) => {
              const dayEvents = eventsForDay(day);
              const inMonth = isSameMonth(day, cursor);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isT = isToday(day);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`min-h-[56px] p-1 border-r border-b text-left transition-colors relative ${
                    !inMonth ? "bg-gray-50" : isSelected ? "bg-pink-50" : "hover:bg-gray-50"
                  }`}
                >
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                    isT ? "bg-green-700 text-white" : inMonth ? "text-gray-800" : "text-gray-300"
                  }`}>{format(day, "d")}</span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayEvents.slice(0, 2).map(e => (
                      <div key={e.id} className="text-[10px] bg-pink-100 text-pink-800 rounded px-1 truncate leading-tight py-0.5">{e.event_title}</div>
                    ))}
                    {dayEvents.length > 2 && <div className="text-[10px] text-gray-400">+{dayEvents.length - 2} more</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Week grid */}
      {viewMode === "week" && (
        <div>
          <div className="grid grid-cols-7 border-b">
            {weekDays.map(day => (
              <div key={day.toString()} className={`text-center py-3 border-r ${isToday(day) ? "bg-green-50" : ""}`}>
                <div className="text-xs text-gray-400">{format(day, "EEE")}</div>
                <div className={`text-sm font-semibold mt-0.5 w-7 h-7 mx-auto flex items-center justify-center rounded-full ${isToday(day) ? "bg-green-700 text-white" : "text-gray-800"}`}>
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[120px]">
            {weekDays.map(day => {
              const dayEvents = eventsForDay(day);
              return (
                <div key={day.toString()} className={`border-r p-1.5 space-y-1 ${isToday(day) ? "bg-green-50/50" : ""}`}>
                  {dayEvents.map(e => (
                    <button
                      key={e.id}
                      onClick={() => setSelectedDay(isSameDay(day, selectedDay) ? null : day)}
                      className="w-full text-left text-[10px] bg-pink-100 text-pink-800 rounded px-1.5 py-1 truncate hover:bg-pink-200 transition"
                    >
                      {e.event_time && <span className="font-semibold">{e.event_time} </span>}{e.event_title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div className="divide-y max-h-[440px] overflow-y-auto">
          {upcomingEvents.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">No upcoming events posted yet.</div>
          ) : (
            upcomingEvents.map(e => (
              <div key={e.id} className="px-4 py-3">
                <EventCard event={e} rsvps={rsvps} currentUser={currentUser} onRsvpToggle={(event, isRsvped) => rsvpMutation.mutate({ event, isRsvped })} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Selected day panel */}
      {selectedDay && selectedDayEvents.length > 0 && viewMode !== "list" && (
        <div className="border-t px-4 py-3 bg-pink-50/40 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{format(selectedDay, "EEEE, MMMM d")}</p>
          {selectedDayEvents.map(e => (
            <EventCard key={e.id} event={e} rsvps={rsvps} currentUser={currentUser} onRsvpToggle={(event, isRsvped) => rsvpMutation.mutate({ event, isRsvped })} />
          ))}
        </div>
      )}
      {selectedDay && selectedDayEvents.length === 0 && viewMode !== "list" && (
        <div className="border-t px-4 py-3 bg-gray-50 text-xs text-gray-400 text-center">No events on {format(selectedDay, "MMMM d")}.</div>
      )}
    </div>
  );
}