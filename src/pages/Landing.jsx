import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Leaf, MapPin, Users, BookOpen, ArrowRight, Heart, Calendar, Clock, ChevronRight } from "lucide-react";
import { format, parseISO, isFuture } from "date-fns";

const FEATURES = [
  {
    icon: MapPin,
    title: "Find Food Near You",
    desc: "Interactive map of food pantries, farmers markets, mobile markets, and more across Genesee County.",
    color: "bg-green-100 text-green-700",
    href: "/Map",
  },
  {
    icon: Users,
    title: "Community Feed",
    desc: "Share recipes, tips, and local resources with neighbors who care about food access.",
    color: "bg-emerald-100 text-emerald-700",
    href: "/Feed",
  },
  {
    icon: BookOpen,
    title: "Learn & Grow",
    desc: "Access guides on nutrition, SNAP/EBT benefits, cooking on a budget, and more.",
    color: "bg-teal-100 text-teal-700",
    href: "/Learn",
  },
];

const EVENT_TYPE_COLORS = {
  "Farmers Market": "bg-green-100 text-green-700",
  "Food Distribution": "bg-blue-100 text-blue-700",
  "Workshop": "bg-purple-100 text-purple-700",
  "Community Meal": "bg-orange-100 text-orange-700",
  "Volunteer": "bg-pink-100 text-pink-700",
  "Other": "bg-gray-100 text-gray-700",
};

function EventCard({ event }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2 hover:shadow-md transition">
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.Other}`}>
        {event.event_type}
      </span>
      <h3 className="font-bold text-gray-900 leading-tight">{event.title}</h3>
      {event.description && <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {format(parseISO(event.date), "MMM d, yyyy")}
        </span>
        {event.time && (
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {event.time}
          </span>
        )}
        {event.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {event.location}
          </span>
        )}
      </div>
      {event.rsvp_url && (
        <a
          href={event.rsvp_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-green-700 hover:underline mt-1 flex items-center gap-1"
        >
          RSVP <ChevronRight className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

export default function Landing() {
  const { data: events = [] } = useQuery({
    queryKey: ["landing-events"],
    queryFn: () => base44.entities.Event.filter({ is_published: true }, "date", 20),
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["landing-resources"],
    queryFn: () => base44.entities.FoodResource.filter({ is_active: true }, "-created_date", 200),
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["landing-posts"],
    queryFn: () => base44.entities.Post.filter({ is_published: true }, "-created_date", 200),
  });

  const upcomingEvents = events
    .filter(e => e.date && isFuture(parseISO(e.date)))
    .slice(0, 3);

  const stats = [
    { label: "Food Resources", value: resources.length || "50+", icon: MapPin },
    { label: "Community Posts", value: posts.length || "100+", icon: Users },
    { label: "Upcoming Events", value: upcomingEvents.length || events.length || "10+", icon: Calendar },
    { label: "Counties Served", value: "1", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="bg-gradient-to-r from-green-700 to-emerald-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="text-white font-bold text-xl">Flint Eats</span>
        </div>
        <a
          href="/AuthGateway"
          className="text-sm font-medium text-white border border-white/40 rounded-full px-5 py-2 hover:bg-white/10 transition"
        >
          Sign In
        </a>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-700 via-emerald-800 to-green-900 text-white px-6 py-28 text-center overflow-hidden">
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -right-10 w-96 h-96 bg-white/5 rounded-full" />
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Leaf className="w-4 h-4" />
            Serving Flint &amp; Genesee County
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
            Nourishing Our Community,<br />Together.
          </h1>
          <p className="text-green-100 text-lg mb-10 max-w-xl mx-auto">
            Flint Eats connects residents with local food resources, community knowledge, and the programs that make healthy eating possible for everyone.
          </p>
          <button
            onClick={() => base44.auth.redirectToLogin("/Feed")}
            className="inline-flex items-center gap-2 bg-white text-green-800 font-bold px-9 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:bg-green-50 transition text-base"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-green-200 text-sm mt-4">Free to join · No cost, ever</p>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="bg-green-800 text-white px-6 py-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon className="w-5 h-5 text-green-300 mb-1" />
              <span className="text-2xl font-extrabold">{value}</span>
              <span className="text-xs text-green-300">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {FEATURES.map(({ icon: Icon, title, desc, color, href }) => (
          <button
            key={title}
            onClick={() => base44.auth.redirectToLogin(href)}
            className="text-center group cursor-pointer rounded-2xl p-6 hover:bg-green-50 transition border border-transparent hover:border-green-100"
          >
            <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
              <Icon className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              Explore <ChevronRight className="w-3 h-3" />
            </span>
          </button>
        ))}
      </section>

      {/* Upcoming Events */}
      {(upcomingEvents.length > 0 || events.length > 0) && (
        <section className="bg-gray-50 border-y border-gray-100 px-6 py-14">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Community Events</h2>
                <p className="text-gray-500 text-sm mt-1">Join us — food, learning, and connection for everyone.</p>
              </div>
              <button
                onClick={() => base44.auth.redirectToLogin("/Feed")}
                className="text-sm font-semibold text-green-700 hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(upcomingEvents.length > 0 ? upcomingEvents : events.slice(0, 3)).map(e => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mission */}
      <section className="px-6 py-16 text-center max-w-2xl mx-auto">
        <Heart className="w-8 h-8 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed">
          Food security is a community issue. Flint Eats was built to make it easier for Flint residents to find fresh food, share what they know, and support one another — neighborhood by neighborhood.
        </p>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-green-700 to-emerald-900 px-6 py-16 text-center text-white">
        <h2 className="text-2xl font-bold mb-3">Ready to join the community?</h2>
        <p className="text-green-200 mb-8">Create a free account and start exploring resources today.</p>
        <button
          onClick={() => base44.auth.redirectToLogin("/Feed")}
          className="inline-flex items-center gap-2 bg-white text-green-800 font-bold px-9 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:bg-green-50 transition"
        >
          Join Flint Eats <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 px-6 py-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg">🌿</span>
          <span className="text-white font-semibold">Flint Eats</span>
        </div>
        <p>Connecting Flint &amp; Genesee County to the food they deserve.</p>
        <p className="mt-1 text-gray-600">© {new Date().getFullYear()} Flint Eats. All rights reserved.</p>
      </footer>
    </div>
  );
}