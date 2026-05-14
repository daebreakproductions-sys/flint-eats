import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, Mail, Building2, Phone, Shield, Save, X } from "lucide-react";
import { toast } from "sonner";

export const ROLE_CONFIG = {
  admin: { label: "Admin", color: "bg-green-700 text-white", description: "Full platform access, manages all data and users" },
  resource_manager: { label: "Resource Manager", color: "bg-muted text-muted-foreground", description: "Can add/edit food resource locations" },
  partner_org: { label: "Partner Organization", color: "bg-muted text-muted-foreground", description: "Represents a food bank, pantry, or community partner" },
  volunteer: { label: "Volunteer", color: "bg-muted text-muted-foreground", description: "Community volunteer helping with outreach" },
  resident: { label: "Resident", color: "bg-muted text-muted-foreground", description: "Genesee County resident seeking resources" },
  user: { label: "General User", color: "bg-muted text-muted-foreground", description: "Basic account access" },
};

function InviteForm({ onClose }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await base44.users.inviteUser(email, role === "admin" ? "admin" : "user");
      toast.success(`Invite sent to ${email}`);
      onClose();
    } catch (e) {
      toast.error("Failed to send invite: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl bg-green-50 mb-4 space-y-3">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        <UserPlus className="w-4 h-4" /> Invite New User
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Email Address *</Label>
          <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" type="email" />
        </div>
        <div>
          <Label>Account Type</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_CONFIG).map(([k, { label }]) => (
                <SelectItem key={k} value={k}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {role && (
        <p className="text-xs text-gray-500 italic">{ROLE_CONFIG[role]?.description}</p>
      )}
      <div className="flex gap-2">
        <Button onClick={handleInvite} disabled={loading || !email} className="bg-green-700 hover:bg-green-800">
          <Mail className="w-4 h-4 mr-1" /> {loading ? "Sending..." : "Send Invite"}
        </Button>
        <Button variant="outline" onClick={onClose}>
          <X className="w-4 h-4 mr-1" /> Cancel
        </Button>
      </div>
    </div>
  );
}

function UserRow({ user, onRoleChange }) {
  const [editing, setEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role || "user");
  const cfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;

  const handleSave = () => {
    onRoleChange(user.id, selectedRole);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 gap-3 flex-wrap">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-green-700">
            {(user.full_name || user.email || "?")[0].toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm text-foreground truncate">{user.full_name || "—"}</p>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <Mail className="w-3 h-3" /> {user.email}
          </p>
          {user.organization && (
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {user.organization}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {editing ? (
          <>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_CONFIG).map(([k, { label }]) => (
                  <SelectItem key={k} value={k} className="text-xs">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="h-8 bg-green-700 hover:bg-green-800" onClick={handleSave}>
              <Save className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="outline" className="h-8" onClick={() => setEditing(false)}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <>
            <Badge className={cfg.color + " text-xs"}>{cfg.label}</Badge>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setEditing(true)}>
              <Shield className="w-3.5 h-3.5 mr-1" /> Change Role
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function UsersTab() {
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-admin"],
    queryFn: () => base44.entities.User.list("-created_date", 500),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => base44.entities.User.update(id, { role }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users-admin"] }); toast.success("Role updated!"); },
  });

  const filtered = users.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!u.full_name?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q) && !u.organization?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const roleCounts = Object.fromEntries(
    Object.keys(ROLE_CONFIG).map(r => [r, users.filter(u => u.role === r).length])
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">User Accounts</CardTitle>
        <Button onClick={() => setShowInvite(true)} className="bg-green-700 hover:bg-green-800" size="sm">
          <UserPlus className="w-4 h-4 mr-1" /> Invite User
        </Button>
      </CardHeader>
      <CardContent>
        {showInvite && <InviteForm onClose={() => setShowInvite(false)} />}

        {/* Role summary pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(ROLE_CONFIG).map(([role, { label, color }]) => (
            roleCounts[role] > 0 && (
              <button
                key={role}
                onClick={() => setRoleFilter(roleFilter === role ? "all" : role)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 transition-all ${color} ${roleFilter === role ? "ring-2 ring-offset-1 ring-green-600" : ""}`}
              >
                {label} · {roleCounts[role]}
              </button>
            )
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All Roles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.entries(ROLE_CONFIG).map(([k, { label }]) => (
                <SelectItem key={k} value={k}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground mb-2">{filtered.length} of {users.length} users</p>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.map(u => (
              <UserRow key={u.id} user={u} onRoleChange={(id, role) => updateRoleMutation.mutate({ id, role })} />
            ))}
            {filtered.length === 0 && (
              <p className="text-center py-10 text-muted-foreground text-sm">No users found.</p>
            )}
          </div>
        )}

        {/* Role legend */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs font-semibold text-muted-foreground mb-2">ACCOUNT TYPES</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(ROLE_CONFIG).map(([role, { label, color, description }]) => (
              <div key={role} className="flex items-start gap-2">
                <Badge className={color + " text-xs shrink-0 mt-0.5"}>{label}</Badge>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}