import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Mail, Users, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ROLE_CONFIG } from "@/components/admin/UsersTab";

function exportCSV(users) {
  const headers = ["Full Name", "Email", "Role", "Joined Date"];
  const rows = users.map(u => [
    u.full_name || "",
    u.email || "",
    ROLE_CONFIG[u.role]?.label || u.role || "user",
    u.created_date ? format(parseISO(u.created_date), "yyyy-MM-dd") : "",
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `flint-eats-audience-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function NewsletterTab() {
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-newsletter"],
    queryFn: () => base44.entities.User.list("-created_date", 1000),
  });

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q);
  });

  // Stats
  const totalCount = users.length;
  const thisMonth = users.filter(u => {
    if (!u.created_date) return false;
    const d = parseISO(u.created_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                <p className="text-xs text-gray-500">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{thisMonth}</p>
                <p className="text-xs text-gray-500">Joined This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                <p className="text-xs text-gray-500">Newsletter Audience</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audience Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Audience List</CardTitle>
          <Button
            onClick={() => exportCSV(filtered)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
            disabled={filtered.length === 0}
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-2">{filtered.length} of {users.length} members</p>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-gray-500 uppercase tracking-wide">
                    <th className="text-left py-2 pr-4">Name</th>
                    <th className="text-left py-2 pr-4">Email</th>
                    <th className="text-left py-2 pr-4">Role</th>
                    <th className="text-left py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => {
                    const cfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.user;
                    return (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-green-700">
                                {(u.full_name || u.email || "?")[0].toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900 truncate max-w-[160px]">
                              {u.full_name || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 text-gray-600 truncate max-w-[200px]">{u.email}</td>
                        <td className="py-2.5 pr-4">
                          <Badge className={cfg.color + " text-xs"}>{cfg.label}</Badge>
                        </td>
                        <td className="py-2.5 text-gray-500 text-xs whitespace-nowrap">
                          {u.created_date ? format(parseISO(u.created_date), "MMM d, yyyy") : "—"}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-gray-400">No members found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}