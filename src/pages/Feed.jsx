import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import CreatePost from "@/components/feed/CreatePost";
import PostCard from "@/components/feed/PostCard";
import EventsSidebar from "@/components/feed/EventsSidebar";
import CommunityCalendar from "@/components/feed/CommunityCalendar";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { Flame, Clock, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Recipe", "Resource Tip", "Community News", "Event", "Question", "Success Story", "General"];

export default function Feed() {
  const [tab, setTab] = useState("feed"); // feed | calendar
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const qc = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: isAuthenticated, isLoading: isAuthLoading } = useQuery({
    queryKey: ["isAuthenticated"],
    queryFn: () => base44.auth.isAuthenticated(),
  });

  const { data: posts = [], isLoading, isFetching } = useQuery({
    queryKey: ["feed-posts"],
    queryFn: () => base44.entities.Post.filter({ is_published: true }, "-created_date", 100),
    enabled: isAuthenticated,
  });

  const filtered = posts
    .filter(p => categoryFilter === "All" || p.category === categoryFilter)
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      if (sortBy === "popular") return (b.likes || 0) - (a.likes || 0);
      return new Date(b.created_date) - new Date(a.created_date);
    });

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🌱</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Join Our Community!</h2>
          <p className="text-slate-600 mb-6">
            Sign in to share recipes, discover community events, connect with neighbors, and stay updated on food resources in Genesee County.
          </p>
          <Button
            onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
            className="w-full bg-green-700 hover:bg-green-800 text-white"
          >
            Sign In or Sign Up
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={() => qc.invalidateQueries({ queryKey: ["feed-posts"] })}>
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Feed */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tab switcher */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setTab("feed")}
                className={`flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${tab === "feed" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Flame className="w-4 h-4 text-orange-500" /> Feed
              </button>
              <button
                onClick={() => setTab("calendar")}
                className={`flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${tab === "calendar" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <CalendarDays className="w-4 h-4 text-pink-500" /> Calendar
              </button>
            </div>

            {tab === "feed" && (
              <div className="flex items-center gap-2">
                <button onClick={() => setSortBy("newest")} className={`flex items-center gap-1 text-xs px-4 py-2 rounded-full border transition-colors min-h-[36px] ${sortBy === "newest" ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"}`}>
                  <Clock className="w-3.5 h-3.5" /> New
                </button>
                <button onClick={() => setSortBy("popular")} className={`flex items-center gap-1 text-xs px-4 py-2 rounded-full border transition-colors min-h-[36px] ${sortBy === "popular" ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"}`}>
                  <Flame className="w-3.5 h-3.5" /> Hot
                </button>
              </div>
            )}
          </div>

          {tab === "calendar" ? (
            <CommunityCalendar currentUser={user} />
          ) : (
            <>
              {/* Category pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)}
                    className={`shrink-0 text-xs px-3 py-2 rounded-full border font-medium transition-colors min-h-[36px] ${categoryFilter === cat ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"}`}>
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
            </>
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
    </PullToRefresh>
  );
}