import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus, Save, X, Upload, Star } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Nutrition", "Cooking", "Food Safety", "Benefits & Programs", "Community", "Other"];
const CONTENT_TYPES = ["Video", "Article", "Guide", "Infographic"];

const EMPTY = {
  title: "", description: "", category: "Nutrition", content_type: "Article",
  url: "", thumbnail_url: "", duration_minutes: "", tags: [],
  is_featured: false, is_published: true,
};

function EducationForm({ resource, onSave, onCancel }) {
  const [form, setForm] = useState(resource || EMPTY);
  const [uploading, setUploading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("thumbnail_url", file_url);
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <Label>Title *</Label>
          <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Resource title" />
        </div>
        <div className="md:col-span-2">
          <Label>Description</Label>
          <Input value={form.description} onChange={e => set("description", e.target.value)} placeholder="Brief description..." />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={form.category} onValueChange={v => set("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Content Type</Label>
          <Select value={form.content_type} onValueChange={v => set("content_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label>URL (link to resource)</Label>
          <Input value={form.url} onChange={e => set("url", e.target.value)} placeholder="https://..." />
        </div>
        <div className="md:col-span-2">
          <Label>Thumbnail URL</Label>
          <div className="flex gap-2">
            <Input value={form.thumbnail_url} onChange={e => set("thumbnail_url", e.target.value)} placeholder="https://... or upload below" />
            <label className="shrink-0">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <Button type="button" variant="outline" size="sm" asChild>
                <span className="cursor-pointer flex items-center gap-1">
                  {uploading ? <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Upload
                </span>
              </Button>
            </label>
          </div>
          {form.thumbnail_url && (
            <img src={form.thumbnail_url} alt="Preview" className="mt-2 h-24 w-auto rounded-lg object-cover border" />
          )}
        </div>
        <div>
          <Label>Duration (minutes)</Label>
          <Input type="number" value={form.duration_minutes} onChange={e => set("duration_minutes", e.target.value ? Number(e.target.value) : "")} placeholder="e.g. 5" />
        </div>
        <div>
          <Label>Tags (comma-separated)</Label>
          <Input
            value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags}
            onChange={e => set("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
            placeholder="snap, wic, budget"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Switch checked={!!form.is_featured} onCheckedChange={v => set("is_featured", v)} />
          <Label>Featured</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={!!form.is_published} onCheckedChange={v => set("is_published", v)} />
          <Label>Published</Label>
        </div>
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

export default function EducationTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState("");

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["education-resources-admin"],
    queryFn: () => base44.entities.EducationResource.list("-created_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EducationResource.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["education-resources-admin"] }); qc.invalidateQueries({ queryKey: ["education-resources"] }); setShowNew(false); toast.success("Resource added!"); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EducationResource.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["education-resources-admin"] }); qc.invalidateQueries({ queryKey: ["education-resources"] }); setEditing(null); toast.success("Resource updated!"); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EducationResource.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["education-resources-admin"] }); qc.invalidateQueries({ queryKey: ["education-resources"] }); toast.success("Resource deleted."); }
  });

  const filtered = resources.filter(r =>
    !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Manage Education Resources</CardTitle>
        <Button onClick={() => setShowNew(true)} className="bg-green-700 hover:bg-green-800" size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add Resource
        </Button>
      </CardHeader>
      <CardContent>
        {showNew && (
          <div className="mb-6 p-4 border rounded-xl bg-green-50">
            <h3 className="font-semibold mb-3">New Education Resource</h3>
            <EducationForm onSave={d => createMutation.mutate(d)} onCancel={() => setShowNew(false)} />
          </div>
        )}

        <Input
          placeholder="Search resources..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-3"
        />

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.map(r => (
              <div key={r.id}>
                {editing?.id === r.id ? (
                  <div className="p-4 border rounded-xl bg-yellow-50">
                    <EducationForm
                      resource={editing}
                      onSave={d => updateMutation.mutate({ id: r.id, data: d })}
                      onCancel={() => setEditing(null)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3 min-w-0">
                      {r.thumbnail_url && (
                        <img src={r.thumbnail_url} alt="" className="w-12 h-9 object-cover rounded shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-sm truncate">{r.title}</p>
                          {r.is_featured && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500">{r.category} · {r.content_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Badge className={r.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}>
                        {r.is_published ? "Published" : "Draft"}
                      </Badge>
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setEditing(r)}>
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
            {filtered.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No resources found.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}