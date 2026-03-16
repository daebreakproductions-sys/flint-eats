import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus, MapPin, BookOpen, Save, X, Users, Mail } from "lucide-react";
import { TYPE_CONFIG } from "@/components/map/MapLegend";
import { toast } from "sonner";
import UsersTab from "@/components/admin/UsersTab";
import NewsletterTab from "@/components/admin/NewsletterTab";

const EMPTY_RESOURCE = {
  name: "", address: "", phone: "", lat: "", lng: "",
  type: "Other", hours: "", notes: "", email: "", url: "",
  ebt_accepted: false, dufb_offered: false, wic_accepted: false, is_active: true
};

function ResourceForm({ resource, onSave, onCancel }) {
  const [form, setForm] = useState(resource || EMPTY_RESOURCE);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <Label>Name *</Label>
          <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Resource name" />
        </div>
        <div className="md:col-span-2">
          <Label>Address</Label>
          <Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Street address" />
        </div>
        <div>
          <Label>Type</Label>
          <Select value={form.type} onValueChange={v => set("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(TYPE_CONFIG).map(([k, { label }]) => (
                <SelectItem key={k} value={k}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(810) 000-0000" />
        </div>
        <div>
          <Label>Latitude</Label>
          <Input type="number" value={form.lat} onChange={e => set("lat", parseFloat(e.target.value))} placeholder="43.012" />
        </div>
        <div>
          <Label>Longitude</Label>
          <Input type="number" value={form.lng} onChange={e => set("lng", parseFloat(e.target.value))} placeholder="-83.687" />
        </div>
        <div className="md:col-span-2">
          <Label>Hours</Label>
          <Input value={form.hours} onChange={e => set("hours", e.target.value)} placeholder="Mon-Fri 9am-5pm" />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={form.email} onChange={e => set("email", e.target.value)} />
        </div>
        <div>
          <Label>Website URL</Label>
          <Input value={form.url} onChange={e => set("url", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Notes</Label>
          <Input value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Additional info..." />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        {[
          { key: "ebt_accepted", label: "EBT/SNAP Accepted" },
          { key: "dufb_offered", label: "Double Up Food Bucks" },
          { key: "wic_accepted", label: "WIC Accepted" },
          { key: "is_active", label: "Active / Visible" },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <Switch checked={!!form[key]} onCheckedChange={v => set(key, v)} />
            <Label>{label}</Label>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={() => onSave(form)} className="bg-green-700 hover:bg-green-800">
          <Save className="w-4 h-4 mr-1" /> Save
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-1" /> Cancel
        </Button>
      </div>
    </div>
  );
}

export default function Admin() {
  const qc = useQueryClient();
  const [editingResource, setEditingResource] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [resourceSearch, setResourceSearch] = useState("");

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["food-resources-admin"],
    queryFn: () => base44.entities.FoodResource.list("name", 1000),
  });

  const { data: edResources = [] } = useQuery({
    queryKey: ["education-resources"],
    queryFn: () => base44.entities.EducationResource.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FoodResource.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["food-resources-admin"] }); qc.invalidateQueries({ queryKey: ["food-resources"] }); setShowNewForm(false); toast.success("Location added!"); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FoodResource.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["food-resources-admin"] }); qc.invalidateQueries({ queryKey: ["food-resources"] }); setEditingResource(null); toast.success("Location updated!"); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FoodResource.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["food-resources-admin"] }); qc.invalidateQueries({ queryKey: ["food-resources"] }); toast.success("Location deleted."); }
  });

  const filteredResources = resources.filter(r =>
    !resourceSearch || r.name?.toLowerCase().includes(resourceSearch.toLowerCase()) || r.address?.toLowerCase().includes(resourceSearch.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="resources">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="resources" className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> Food Resources ({resources.length})
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" /> Education ({edResources.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="newsletter" className="flex items-center gap-1.5">
            <Mail className="w-4 h-4" /> Newsletter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resources">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Manage Locations</CardTitle>
              <Button onClick={() => setShowNewForm(true)} className="bg-green-700 hover:bg-green-800" size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Location
              </Button>
            </CardHeader>
            <CardContent>
              {showNewForm && (
                <div className="mb-6 p-4 border rounded-xl bg-green-50">
                  <h3 className="font-semibold mb-3">New Location</h3>
                  <ResourceForm onSave={d => createMutation.mutate(d)} onCancel={() => setShowNewForm(false)} />
                </div>
              )}

              <Input
                placeholder="Search locations..."
                value={resourceSearch}
                onChange={e => setResourceSearch(e.target.value)}
                className="mb-3"
              />

              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredResources.map(r => (
                    <div key={r.id}>
                      {editingResource?.id === r.id ? (
                        <div className="p-4 border rounded-xl bg-yellow-50">
                          <ResourceForm
                            resource={editingResource}
                            onSave={d => updateMutation.mutate({ id: r.id, data: d })}
                            onCancel={() => setEditingResource(null)}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-lg">{(TYPE_CONFIG[r.type] || TYPE_CONFIG.Other).emoji}</span>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{r.name}</p>
                              <p className="text-xs text-gray-500 truncate">{r.address}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            {!r.is_active && <Badge variant="outline" className="text-xs text-gray-400">Inactive</Badge>}
                            {r.ebt_accepted && <Badge className="bg-blue-100 text-blue-800 text-xs">EBT</Badge>}
                            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setEditingResource(r)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-red-400 hover:text-red-600" onClick={() => deleteMutation.mutate(r.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Education Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Education resources can be added via the database. Use the Admin panel to manage videos, articles, and guides shown on the Learn page.</p>
              <div className="mt-4 space-y-2">
                {edResources.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{r.title}</p>
                      <p className="text-xs text-gray-500">{r.category} · {r.content_type}</p>
                    </div>
                    <Badge className={r.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                      {r.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                ))}
                {edResources.length === 0 && <p className="text-sm text-gray-400">No education resources yet.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}