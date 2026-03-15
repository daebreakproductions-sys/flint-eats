import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Calendar, MapPin, Clock, ExternalLink } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";

const EVENT_COLORS = {
  "Farmers Market": "bg-green-100 text-green-700",
  "Food Distribution": "bg-orange-100 text-orange-700",
  Workshop: "bg-blue-100 text-blue-700",
  "Community Meal": "bg-pink-100 text-pink-700",
  Volunteer: "bg-purple-100 text-purple-700",
  Other: "bg-gray-100 text-gray-700",
};

export default function EventsSidebar() {
  const { data: events = [] } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: () => base44.entities.Event.filter({ is_published: true }, "date", 20),
  });

  const upcoming = events.filter(e => {
    try { return !isPast(parseISO(e.date + "T23:59:00")); } catch { return true; }
  }).slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Upcoming Events */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-green-600" /> Upcoming Events
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-3">No upcoming events. Check back soon!</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map(event => {
              const colorCls = EVENT_COLORS[event.event_type] || EVENT_COLORS.Other;
              return (
                <div key={event.id} className="group">
                  <div className="flex items-start gap-3">
                    <div className="text-center bg-green-50 rounded-xl p-2 min-w-[44px]">
                      <p className="text-xs text-green-600 font-semibold uppercase leading-none">
                        {event.date ? format(parseISO(event.date), "MMM") : ""}
                      </p>
                      <p className="text-lg font-bold text-green-800 leading-tight">
                        {event.date ? format(parseISO(event.date), "d") : ""}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{event.title}</p>
                      <span className={`inline-block text-xs rounded-full px-2 py-0.5 mt-0.5 ${colorCls}`}>{event.event_type}</span>
                      {event.location && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" /> {event.location}
                        </p>
                      )}
                      {event.time && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {event.time}
                        </p>
                      )}
                      {event.rsvp_url && (
                        <a href={event.rsvp_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-1">
                          <ExternalLink className="w-3 h-3" /> RSVP / Learn More
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* About card */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-800 rounded-2xl p-4 text-white">
        <h3 className="font-bold text-lg mb-1">🌱 Flint Eats</h3>
        <p className="text-sm text-green-100 leading-relaxed">
          Michigan's healthy food social network — connecting communities with fresh food resources, recipes, and programs across Genesee County and beyond.
        </p>
        <div className="mt-3 pt-3 border-t border-green-600">
          <p className="text-xs text-green-200">Growing statewide across Michigan 🍎</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-700 text-sm mb-3">Community</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Counties", value: "Growing" },
            { label: "State", value: "Michigan" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-green-800">{value}</p>
              <p className="text-xs text-green-600">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}