import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, FileText, Star, MessageSquare, CalendarDays, TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// How many of this entity were created in the last 7 days
function countRecent(items) {
  if (!items) return null;
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return items.filter(i => new Date(i.created_date).getTime() > cutoff).length;
}

function TrendBadge({ recent }) {
  if (recent === null) return null;
  if (recent > 0) return (
    <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
      <TrendingUp className="w-3 h-3" />+{recent} this week
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-xs text-gray-400 font-medium">
      <Minus className="w-3 h-3" />No new this week
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, color, recent, emptyHint }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-default">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`p-3 rounded-xl ${color} shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {value === 0 && emptyHint
            ? <p className="text-xs text-gray-400 mt-0.5 leading-tight">{emptyHint}</p>
            : <TrendBadge recent={recent} />
          }
        </div>
      </CardContent>
    </Card>
  );
}

const TYPE_COLORS = {
  FoodPantry: "bg-orange-400", GroceryStore: "bg-blue-400", FarmersMarket: "bg-green-500",
  MobileMarket: "bg-purple-400", SeniorMealSite: "bg-pink-400", Pharmacy: "bg-cyan-400",
  Convenience: "bg-yellow-400", Other: "bg-gray-400",
};
const TYPE_LABELS = {
  FoodPantry: "Food Pantry", GroceryStore: "Grocery Store", FarmersMarket: "Farmers Market",
  MobileMarket: "Mobile Market", SeniorMealSite: "Senior Meal Site", Pharmacy: "Pharmacy",
  Convenience: "Convenience", Other: "Other",
};

function ResourcesByType({ allResources }) {
  if (!allResources) return null;
  const active = allResources.filter(r => r.is_active);
  const inactive = allResources.filter(r => !r.is_active);
  const total = allResources.length || 1;

  const typeCounts = Object.keys(TYPE_LABELS).map(type => ({
    type,
    count: allResources.filter(r => r.type === type).length,
  })).filter(t => t.count > 0).sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">Resources by Type</h3>
          <div className="flex gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{active.length} active</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />{inactive.length} inactive</span>
          </div>
        </div>
        <div className="space-y-2">
          {typeCounts.map(({ type, count }) => (
            <div key={type} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-36 shrink-0">{TYPE_LABELS[type]}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                <div
                  className={`${TYPE_COLORS[type]} h-2.5 rounded-full`}
                  style={{ width: `${(count / total) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewsInsights({ reviews, resources }) {
  if (!reviews || reviews.length === 0) return null;

  // avg rating per resource type
  const resourceMap = {};
  (resources || []).forEach(r => { resourceMap[r.id] = r.type; });

  const byType = {};
  reviews.forEach(rv => {
    const type = resourceMap[rv.food_resource_id] || "Other";
    if (!byType[type]) byType[type] = [];
    byType[type].push(rv.rating);
  });

  const avgByType = Object.entries(byType).map(([type, ratings]) => ({
    type,
    avg: (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1),
    count: ratings.length,
  })).sort((a, b) => b.avg - a.avg);

  const overallAvg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">Reviews Overview</h3>
          <span className="text-sm font-bold text-yellow-500">⭐ {overallAvg} avg</span>
        </div>
        <div className="space-y-2">
          {avgByType.map(({ type, avg, count }) => (
            <div key={type} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{TYPE_LABELS[type] || type}</span>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 font-medium">⭐ {avg}</span>
                <span className="text-gray-400 text-xs">({count} review{count !== 1 ? "s" : ""})</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivity({ posts, reviews, users }) {
  const items = [
    ...(posts || []).slice(0, 5).map(p => ({
      type: "post", label: `New post: "${p.content?.slice(0, 40)}…"`,
      sub: `by ${p.author_name || p.author_email}`, date: p.created_date,
    })),
    ...(reviews || []).slice(0, 5).map(r => ({
      type: "review", label: `Review submitted (${r.rating}⭐)`,
      sub: `by ${r.user_name || r.user_email}`, date: r.created_date,
    })),
    ...(users || []).slice(0, 5).map(u => ({
      type: "user", label: `New user joined`,
      sub: u.full_name || u.email, date: u.created_date,
    })),
  ]
    .filter(i => i.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  if (items.length === 0) return null;

  const iconMap = { post: "📝", review: "⭐", user: "👤" };

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Recent Activity
        </h3>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-lg leading-none mt-0.5">{iconMap[item.type]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-800 truncate">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub} · {formatDistanceToNow(new Date(item.date), { addSuffix: true })}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MetricsTab() {
  const { data: users } = useQuery({ queryKey: ["metrics-users"], queryFn: () => base44.entities.User.list() });
  const { data: allResources } = useQuery({ queryKey: ["metrics-all-resources"], queryFn: () => base44.entities.FoodResource.list("name", 2000) });
  const { data: posts } = useQuery({ queryKey: ["metrics-posts"], queryFn: () => base44.entities.Post.list("-created_date", 1000) });
  const { data: reviews } = useQuery({ queryKey: ["metrics-reviews"], queryFn: () => base44.entities.Review.list("-created_date", 500) });
  const { data: events } = useQuery({ queryKey: ["metrics-events"], queryFn: () => base44.entities.Event.list() });

  const activeResources = allResources?.filter(r => r.is_active);
  const tips = posts?.filter(p => p.category === "Resource Tip");

  const totalLikes = posts?.reduce((sum, p) => sum + (p.likes || 0), 0) ?? 0;

  return (
    <div className="space-y-5">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard icon={Users} label="Registered Users" value={users?.length} color="bg-blue-500" recent={countRecent(users)} />
        <MetricCard icon={MapPin} label="Active Resources" value={activeResources?.length} color="bg-green-600" recent={countRecent(activeResources)} />
        <MetricCard icon={FileText} label="Total Posts" value={posts?.length} color="bg-purple-500" recent={countRecent(posts)} />
        <MetricCard
          icon={Star} label="Reviews" value={reviews?.length} color="bg-yellow-500"
          recent={countRecent(reviews)}
          emptyHint="Encourage users to leave reviews from the map."
        />
        <MetricCard icon={CalendarDays} label="Events" value={events?.length} color="bg-pink-500" recent={countRecent(events)} />
        <MetricCard icon={MessageSquare} label="Resource Tips" value={tips?.length} color="bg-orange-500" recent={countRecent(tips)} emptyHint="Users can share tips via Community Feed." />
      </div>

      {/* Total Likes */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="flex items-center gap-3 p-4">
          <TrendingUp className="w-5 h-5 text-green-700" />
          <div>
            <span className="font-bold text-green-800 text-lg">{totalLikes}</span>
            <span className="text-green-700 text-sm ml-2">total post likes across the community</span>
          </div>
        </CardContent>
      </Card>

      {/* Posts by Category */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Posts by Category</h3>
          <div className="space-y-2">
            {["Recipe", "Resource Tip", "Community News", "Event", "Question", "Success Story", "General"].map(cat => {
              const count = posts?.filter(p => p.category === cat).length ?? 0;
              const total = posts?.length || 1;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-36 shrink-0">{cat}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resources by Type */}
      <ResourcesByType allResources={allResources} />

      {/* Reviews Insights */}
      <ReviewsInsights reviews={reviews} resources={allResources} />

      {/* Recent Activity */}
      <RecentActivity posts={posts} reviews={reviews} users={users} />
    </div>
  );
}