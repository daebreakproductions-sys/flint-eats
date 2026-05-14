import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, FileText, Star, MessageSquare, CalendarDays } from "lucide-react";

const MetricCard = ({ icon: Icon, label, value, color }) => (
  <Card>
    <CardContent className="flex items-center gap-4 p-5">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </CardContent>
  </Card>
);

export default function MetricsTab() {
  const { data: users } = useQuery({ queryKey: ["metrics-users"], queryFn: () => base44.entities.User.list() });
  const { data: resources } = useQuery({ queryKey: ["metrics-resources"], queryFn: () => base44.entities.FoodResource.filter({ is_active: true }) });
  const { data: posts } = useQuery({ queryKey: ["metrics-posts"], queryFn: () => base44.entities.Post.list("-created_date", 1000) });
  const { data: reviews } = useQuery({ queryKey: ["metrics-reviews"], queryFn: () => base44.entities.Review.list() });
  const { data: events } = useQuery({ queryKey: ["metrics-events"], queryFn: () => base44.entities.Event.list() });

  const tips = posts?.filter(p => p.category === "Resource Tip").length ?? null;
  const recipes = posts?.filter(p => p.category === "Recipe").length ?? null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard icon={Users} label="Registered Users" value={users?.length} color="bg-blue-500" />
        <MetricCard icon={MapPin} label="Active Food Resources" value={resources?.length} color="bg-green-600" />
        <MetricCard icon={FileText} label="Total Posts" value={posts?.length} color="bg-purple-500" />
        <MetricCard icon={Star} label="Reviews Submitted" value={reviews?.length} color="bg-yellow-500" />
        <MetricCard icon={CalendarDays} label="Events" value={events?.length} color="bg-pink-500" />
        <MetricCard icon={MessageSquare} label="Resource Tips" value={tips} color="bg-orange-500" />
      </div>

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
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}