import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Phone, MapPin, Clock, ExternalLink, Filter, Check } from "lucide-react";
import { TYPE_CONFIG } from "@/components/map/MapLegend";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";

const BENEFIT_BADGES = [
  { key: "ebt_accepted", label: "EBT/SNAP", cls: "bg-blue-100 text-blue-800" },
  { key: "dufb_offered", label: "Double Up $", cls: "bg-orange-100 text-orange-800" },
  { key: "wic_accepted", label: "WIC", cls: "bg-purple-100 text-purple-800" },
];

function ResourceCard({ resource }) {
  const cfg = TYPE_CONFIG[resource.type] || TYPE_CONFIG.Other;
  return (
    <Card className="p-4 hover:shadow-md transition-shadow active:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{cfg.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{resource.name}</h3>
            <Badge className="text-white text-xs shrink-0" style={{ backgroundColor: cfg.color }}>
              {cfg.label}
            </Badge>
          </div>
          {resource.address && (
            <div className="flex gap-1.5 mt-1 text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{resource.address}</span>
            </div>
          )}
          {resource.hours && (
            <div className="flex gap-1.5 mt-1 text-sm text-gray-600">
              <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="whitespace-pre-wrap line-clamp-2">{resource.hours}</span>
            </div>
          )}
          {resource.phone && (
            <div className="flex gap-1.5 mt-1 text-sm text-gray-600">
              <Phone className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <a href={`tel:${resource.phone}`} className="text-green-700 hover:underline">{resource.phone}</a>
            </div>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {BENEFIT_BADGES.filter(b => resource[b.key]).map(b => (
              <Badge key={b.key} className={b.cls + " text-xs"}>{b.label}</Badge>
            ))}
            {resource.url && (
              <a href={resource.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-green-700 hover:underline">
                <ExternalLink className="w-3 h-3" /> Website
              </a>
            )}
          </div>
          {resource.notes && (
            <p className="mt-2 text-xs text-gray-500 line-clamp-2">{resource.notes}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

const BENEFIT_OPTIONS = [
  { value: "all", label: "All Benefits" },
  { value: "ebt_accepted", label: "EBT/SNAP" },
  { value: "dufb_offered", label: "Double Up $" },
  { value: "wic_accepted", label: "WIC" },
];

function MobileFilterDrawer({ typeFilter, setTypeFilter, benefitFilter, setBenefitFilter }) {
  const activeCount = (typeFilter !== "all" ? 1 : 0) + (benefitFilter !== "all" ? 1 : 0);
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="relative shrink-0">
          <Filter className="w-4 h-4 mr-1.5" /> Filters
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-700 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{activeCount}</span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filter Resources</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8 space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Resource Type</p>
            <div className="space-y-1">
              <button onClick={() => setTypeFilter("all")} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${typeFilter === "all" ? "bg-green-50 text-green-800 font-medium" : "hover:bg-gray-50 text-gray-700"}`}>
                All Types {typeFilter === "all" && <Check className="w-4 h-4 text-green-700" />}
              </button>
              {Object.entries(TYPE_CONFIG).map(([type, { label, emoji }]) => (
                <button key={type} onClick={() => setTypeFilter(type)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${typeFilter === type ? "bg-green-50 text-green-800 font-medium" : "hover:bg-gray-50 text-gray-700"}`}>
                  <span>{emoji} {label}</span>
                  {typeFilter === type && <Check className="w-4 h-4 text-green-700" />}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Benefits Accepted</p>
            <div className="space-y-1">
              {BENEFIT_OPTIONS.map(({ value, label }) => (
                <button key={value} onClick={() => setBenefitFilter(value)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${benefitFilter === value ? "bg-green-50 text-green-800 font-medium" : "hover:bg-gray-50 text-gray-700"}`}>
                  {label} {benefitFilter === value && <Check className="w-4 h-4 text-green-700" />}
                </button>
              ))}
            </div>
          </div>
          <DrawerClose asChild>
            <Button className="w-full bg-green-700 hover:bg-green-800">Apply Filters</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default function Directory() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [benefitFilter, setBenefitFilter] = useState("all");

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["food-resources"],
    queryFn: async () => {
      try {
        return await base44.entities.FoodResource.filter({ is_active: true }, "name", 1000);
      } catch (error) {
        console.error("Failed to load resources:", error);
        return [];
      }
    },
  });

  const filtered = useMemo(() => {
    return resources.filter(r => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (benefitFilter !== "all" && !r[benefitFilter]) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.name?.toLowerCase().includes(q) && !r.address?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [resources, typeFilter, benefitFilter, search]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Food Resource Directory</h1>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {/* Mobile: Drawer filter sheet */}
        <div className="sm:hidden">
          <MobileFilterDrawer typeFilter={typeFilter} setTypeFilter={setTypeFilter} benefitFilter={benefitFilter} setBenefitFilter={setBenefitFilter} />
        </div>
        {/* Desktop: inline selects */}
        <div className="hidden sm:flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(TYPE_CONFIG).map(([type, { label }]) => (
                <SelectItem key={type} value={type}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={benefitFilter} onValueChange={setBenefitFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Benefits" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Benefits</SelectItem>
              <SelectItem value="ebt_accepted">EBT/SNAP</SelectItem>
              <SelectItem value="dufb_offered">Double Up $</SelectItem>
              <SelectItem value="wic_accepted">WIC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-3">{filtered.length} locations found</p>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => <ResourceCard key={r.id} resource={r} />)}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No results found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}