import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Play, BookOpen, FileText, Image, Clock, Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CONTENT_ICONS = {
  Video: Play,
  Article: FileText,
  Guide: BookOpen,
  Infographic: Image,
};

const CATEGORY_COLORS = {
  Nutrition: "bg-green-100 text-green-800",
  Cooking: "bg-orange-100 text-orange-800",
  "Food Safety": "bg-red-100 text-red-800",
  "Benefits & Programs": "bg-blue-100 text-blue-800",
  Community: "bg-purple-100 text-purple-800",
  Other: "bg-gray-100 text-gray-800",
};

function ResourceCard({ item }) {
  const Icon = CONTENT_ICONS[item.content_type] || BookOpen;
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
      onClick={() => item.url && window.open(item.url, "_blank")}>
      {item.thumbnail_url ? (
        <div className="relative h-40 overflow-hidden bg-gray-100">
          <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          {item.content_type === "Video" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
          <Icon className="w-12 h-12 text-green-400" />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge className={CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other + " text-xs"}>
            {item.category}
          </Badge>
          {item.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />}
        </div>
        <h3 className="font-semibold text-gray-900 leading-tight mb-1">{item.title}</h3>
        {item.description && <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Icon className="w-3.5 h-3.5" />
            <span>{item.content_type}</span>
          </div>
          {item.duration_minutes && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{item.duration_minutes} min</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const SAMPLE_RESOURCES = [
  { id: "s1", title: "Understanding SNAP Benefits in Michigan", category: "Benefits & Programs", content_type: "Article", description: "Learn how to apply for SNAP/EBT benefits and what foods are covered.", is_featured: true, url: "https://www.michigan.gov/mdhhs/assistance-programs/foodassistance", thumbnail_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=250&fit=crop" },
  { id: "s2", title: "Double Up Food Bucks: Stretch Your SNAP", category: "Benefits & Programs", content_type: "Article", description: "Find out how to double your SNAP dollars at farmers markets across Genesee County.", is_featured: true, url: "https://www.doubleupfoodbucks.org/", thumbnail_url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=250&fit=crop" },
  { id: "s3", title: "Healthy Eating on a Budget", category: "Cooking", content_type: "Article", description: "Simple, nutritious recipes using affordable and local ingredients.", url: "https://cdn.realfood.gov/DGA.pdf", thumbnail_url: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=250&fit=crop" },
  { id: "s4", title: "WIC Program Guide for Families", category: "Benefits & Programs", content_type: "Guide", description: "Everything you need to know about WIC eligibility and benefits for mothers and children.", url: "https://www.michigan.gov/mdhhs/assistance-programs/wic" },
  { id: "s5", title: "Safe Food Storage Tips", category: "Food Safety", content_type: "Article", description: "Keep your family safe by learning proper food handling and storage practices.", url: "https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts" },
  { id: "s6", title: "Growing Your Own Vegetables", category: "Nutrition", content_type: "Guide", description: "Community garden basics for beginners — grow fresh produce even in small spaces.", url: "https://extension.msu.edu/topic-areas/food-health/", thumbnail_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop" },
];

export default function Learn() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [contentType, setContentType] = useState("all");

  const { data: dbResources = [] } = useQuery({
    queryKey: ["education-resources"],
    queryFn: () => base44.entities.EducationResource.filter({ is_published: true }, "-created_date", 200),
  });

  const allResources = dbResources.length > 0 ? dbResources : SAMPLE_RESOURCES;

  const filtered = allResources.filter(r => {
    if (category !== "all" && r.category !== category) return false;
    if (contentType !== "all" && r.content_type !== contentType) return false;
    if (search && !r.title?.toLowerCase().includes(search.toLowerCase()) && !r.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const featured = filtered.filter(r => r.is_featured);
  const rest = filtered.filter(r => !r.is_featured);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Education & Resources</h1>
        <p className="text-gray-600 mt-1">Videos, guides, and articles about nutrition, food programs, and healthy eating.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {["Nutrition", "Cooking", "Food Safety", "Benefits & Programs", "Community", "Other"].map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={contentType} onValueChange={setContentType}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {["Video", "Article", "Guide", "Infographic"].map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {featured.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Featured Resources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featured.map(r => <ResourceCard key={r.id} item={r} />)}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div>
          {featured.length > 0 && <h2 className="text-lg font-semibold text-gray-800 mb-3">More Resources</h2>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map(r => <ResourceCard key={r.id} item={r} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No resources found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}