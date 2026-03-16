import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TYPE_CONFIG } from "./MapLegend";

const BENEFIT_FILTERS = [
  { key: "ebt_accepted", label: "EBT/SNAP", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { key: "dufb_offered", label: "Double Up $", color: "bg-orange-100 text-orange-800 border-orange-300" },
  { key: "wic_accepted", label: "WIC", color: "bg-purple-100 text-purple-800 border-purple-300" },
];

export default function MapFilters({ search, setSearch, activeTypes, toggleType, activeBenefits, toggleBenefit, resultCount }) {
  const hasFilters = search || activeTypes.length > 0 || activeBenefits.length > 0;

  const clearAll = () => {
    setSearch("");
    activeTypes.forEach(t => toggleType(t));
    activeBenefits.forEach(b => toggleBenefit(b));
  };

  return (
    <div className="p-3 space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name or item..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-8 text-sm h-9"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2 top-2">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {Object.entries(TYPE_CONFIG).map(([type, { emoji, label, color }]) => {
          const active = activeTypes.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
                active
                  ? "text-white border-transparent"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
              style={active ? { backgroundColor: color } : {}}
            >
              {emoji} {label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1">
        {BENEFIT_FILTERS.map(({ key, label, color }) => {
          const active = activeBenefits.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggleBenefit(key)}
              className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
                active ? color + " border-transparent" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{resultCount} locations shown</span>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-6 text-xs text-red-500 hover:text-red-700 p-1">
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}