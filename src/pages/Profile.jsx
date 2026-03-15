import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, Pencil, Save, X, Mail, Phone, Building2, MapPin, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ROLE_CONFIG } from "@/components/admin/UsersTab";

export default function Profile() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name || "", organization: user.organization || "", phone: user.phone || "", bio: user.bio || "" });
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["me"] }); setEditing(false); toast.success("Profile updated!"); },
  });

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
    </div>
  );

  const roleCfg = ROLE_CONFIG[user?.role] || ROLE_CONFIG.user;
  const initials = (user?.full_name || user?.email || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Cover + Avatar */}
      <div className="relative mb-16">
        <div className="h-40 rounded-2xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800')", backgroundSize: "cover", backgroundPosition: "center" }} />
        </div>
        {/* Avatar */}
        <div className="absolute -bottom-12 left-6">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-green-700 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">{initials}</span>
          </div>
        </div>
        {/* Edit button top-right */}
        <div className="absolute top-3 right-3">
          {!editing ? (
            <Button size="sm" variant="secondary" className="bg-white/80 backdrop-blur-sm" onClick={() => setEditing(true)}>
              <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" className="bg-green-700 hover:bg-green-800" onClick={() => updateMutation.mutate(form)}>
                <Save className="w-3.5 h-3.5 mr-1" /> Save
              </Button>
              <Button size="sm" variant="outline" className="bg-white/80" onClick={() => setEditing(false)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <Card className="shadow-sm">
        <CardContent className="pt-5 space-y-5">
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user?.full_name || "Your Name"}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5" /> {user?.email}
                  </p>
                </div>
                <Badge className={roleCfg.color + " flex items-center gap-1"}>
                  <ShieldCheck className="w-3 h-3" /> {roleCfg.label}
                </Badge>
              </div>

              {user?.bio && <p className="text-gray-700 text-sm leading-relaxed border-l-4 border-green-200 pl-3">{user.bio}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {user?.organization && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span>{user.organization}</span>
                  </div>
                )}
                {user?.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-green-600 shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Genesee County, MI</span>
                </div>
              </div>
            </div>
          )}

          {/* Role description */}
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <p className="text-xs font-semibold text-green-800 mb-0.5">Your Account Type: {roleCfg.label}</p>
            <p className="text-xs text-green-700">{roleCfg.description}</p>
          </div>

          {/* Logout */}
          <div className="pt-2 border-t">
            <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 w-full sm:w-auto" onClick={() => base44.auth.logout()}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}