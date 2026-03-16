import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Pencil, Save, X, Mail, Phone, Building2, LogOut, ShieldCheck,
  MessageSquare, Calendar, BookOpen, Map, ChevronRight, Copy, Check, Trash2, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { ROLE_CONFIG } from "@/components/admin/UsersTab";
import { Link } from "react-router-dom";

const QUICK_LINKS = [
  { label: "Browse Map", icon: Map, to: "/Map", color: "bg-green-50 text-green-700 border-green-100" },
  { label: "Community Feed", icon: MessageSquare, to: "/Feed", color: "bg-blue-50 text-blue-700 border-blue-100" },
  { label: "Events", icon: Calendar, to: "/Feed", color: "bg-purple-50 text-purple-700 border-purple-100" },
  { label: "Learn", icon: BookOpen, to: "/Learn", color: "bg-orange-50 text-orange-700 border-orange-100" },
];

function StatCard({ value, label, color = "text-green-700" }) {
  return (
    <div className="bg-white rounded-xl border p-4 flex flex-col items-center text-center shadow-sm">
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-gray-500 mt-0.5">{label}</span>
    </div>
  );
}

export default function Profile() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: myPosts = [] } = useQuery({
    queryKey: ["my-posts", user?.email],
    queryFn: () => base44.entities.Post.filter({ author_email: user.email }, "-created_date", 100),
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (user) setForm({
      full_name: user.full_name || "",
      organization: user.organization || "",
      phone: user.phone || "",
      bio: user.bio || "",
    });
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["me"] }); setEditing(false); toast.success("Profile updated!"); },
  });

  const copyEmail = () => {
    navigator.clipboard.writeText(user?.email || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
    </div>
  );

  const roleCfg = ROLE_CONFIG[user?.role] || ROLE_CONFIG.user;
  const initials = (user?.full_name || user?.email || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const totalLikes = myPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const joinedDate = user?.created_date ? new Date(user.created_date).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-5">

      {/* Hero Card */}
      <div className="relative rounded-2xl overflow-hidden shadow-md">
        <div className="h-36 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800')", backgroundSize: "cover", backgroundPosition: "center", backgroundBlendMode: "multiply" }} />
        <div className="bg-white px-6 pt-0 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-3">
            <div className="w-20 h-20 rounded-full border-4 border-white bg-green-700 flex items-center justify-center shadow-lg shrink-0">
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
            <div className="flex gap-2 mb-1">
              {!editing ? (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Profile
                </Button>
              ) : (
                <>
                  <Button size="sm" className="bg-green-700 hover:bg-green-800" onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending}>
                    <Save className="w-3.5 h-3.5 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
              <div>
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(810) 000-0000" />
              </div>
              <div className="md:col-span-2">
                <Label>Organization / Agency</Label>
                <Input value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} placeholder="e.g. Flint Food Bank" />
              </div>
              <div className="md:col-span-2">
                <Label>Bio</Label>
                <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us a little about yourself..." rows={3} />
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900">{user?.full_name || "Your Name"}</h2>
                <Badge className={roleCfg.color + " flex items-center gap-1 text-xs"}>
                  <ShieldCheck className="w-3 h-3" /> {roleCfg.label}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                <button onClick={copyEmail} className="flex items-center gap-1 hover:text-green-700 transition">
                  <Mail className="w-3.5 h-3.5" /> {user?.email}
                  {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 opacity-50" />}
                </button>
                {user?.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{user.phone}</span>}
                {user?.organization && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{user.organization}</span>}
                {joinedDate && <span className="flex items-center gap-1 text-xs text-gray-400">Member since {joinedDate}</span>}
              </div>

              {user?.bio && (
                <p className="mt-3 text-sm text-gray-600 leading-relaxed border-l-4 border-green-200 pl-3 italic">{user.bio}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={myPosts.length} label="Posts" />
        <StatCard value={totalLikes} label="Total Likes" color="text-pink-600" />
        <StatCard value={myPosts.filter(p => p.category === "Recipe").length} label="Recipes Shared" color="text-orange-600" />
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Access</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {QUICK_LINKS.map(({ label, icon: Icon, to, color }) => (
            <Link key={label} to={to}
              className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition hover:shadow-sm ${color}`}>
              <div className="flex items-center gap-2"><Icon className="w-4 h-4" />{label}</div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      {myPosts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Recent Posts</h3>
          <div className="space-y-2">
            {myPosts.slice(0, 3).map(post => (
              <div key={post.id} className="bg-white rounded-xl border p-3 flex items-start gap-3 shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <Badge variant="outline" className="text-xs py-0 px-1.5">{post.category}</Badge>
                    <span>❤️ {post.likes || 0}</span>
                    <span>{new Date(post.created_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Info + Logout */}
      <div className="bg-green-50 rounded-xl border border-green-100 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-green-800">Account: {roleCfg.label}</p>
          <p className="text-xs text-green-700">{roleCfg.description}</p>
        </div>
        <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 shrink-0" onClick={() => base44.auth.logout()}>
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>

      {/* Delete Account */}
      <div className="rounded-xl border border-red-100 p-4">
        {!showDeleteConfirm ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Delete Account</p>
              <p className="text-xs text-gray-500 mt-0.5">Permanently remove your account and all data.</p>
            </div>
            <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 shrink-0"
              onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">This action cannot be undone.</p>
                <p className="text-xs text-red-700 mt-0.5">All your posts, messages, and account data will be permanently deleted.</p>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Type <strong>DELETE</strong> to confirm</Label>
              <Input
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className="mt-1 border-red-200 focus-visible:ring-red-400"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}>
                Cancel
              </Button>
              <Button size="sm"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteInput !== "DELETE"}
                onClick={() => { toast.info("Account deletion requested. Please contact support to complete this process."); setShowDeleteConfirm(false); setDeleteInput(""); }}>
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Permanently Delete
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}