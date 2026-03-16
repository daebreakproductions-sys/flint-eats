import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import CreatePost from "@/components/feed/CreatePost";
import PostCard from "@/components/feed/PostCard";
import EventsSidebar from "@/components/feed/EventsSidebar";
import CommunityCalendar from "@/components/feed/CommunityCalendar";
import { Flame, Clock, CalendarDays } from "lucide-react";

const CATEGORIES = ["All", "Recipe", "Resource Tip", "Community News", "Event", "Question", "Success Story", "General"];

export default function Feed() {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["feed-posts"],
    queryFn: () => base44.entities.Post.filter({ is_published: true }, "-created_date", 100),
  });

  const filtered = posts
    .filter(p => categoryFilter === "All" || p.category === categoryFilter)
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      if (sortBy === "popular") return (b.likes || 0) - (a.likes || 0);
      return new Date(b.created_date) - new Date(a.created_date);
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Feed */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Feed header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> Community Feed
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy("newest")}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-colors ${sortBy === "newest" ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"}`}
              >
                <Clock className="w-3 h-3" /> New
              </button>
              <button
                onClick={() => setSortBy("popular")}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-colors ${sortBy === "popular" ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"}`}
              >
                <Flame className="w-3 h-3" /> Hot
              </button>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${categoryFilter === cat ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Create post */}
          {user && <CreatePost user={user} />}

          {/* Posts */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
              <p className="text-4xl mb-3">🥦</p>
              <p className="text-gray-500 font-medium">No posts yet in this category.</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to share something!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(post => (
                <PostCard key={post.id} post={post} currentUser={user} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-4">
            <EventsSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}