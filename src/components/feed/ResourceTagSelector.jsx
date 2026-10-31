import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Store, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TYPE_CONFIG } from "@/components/map/MapLegend";

export default function ResourceTagSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["food-resources"],
    queryFn: () => base44.entities.FoodResource.filter({ is_active: true }, "name", 1000),
    enabled: open,
  });

  const q = query.trim().toLowerCase();
  const matches = (q
    ? resources.filter(r => r.name?.toLowerCase().includes(q) || r.address?.toLowerCase().includes(q))
    : resources
  ).slice(0, 25);

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-green-50 border border-green-200 pl-3 pr-2 py-1.5 self-start">
        <Store className="w-3.5 h-3.5 text-green-700 shrink-0" />
        <span className="text-xs font-semibold text-green-800 truncate">{value.name}</span>
        <button onClick={() => onChange(null)} className="text-green-700/60 hover:text-green-800 shrink-0" aria-label="Remove store tag">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-green-700 transition-colors min-h-[44px] md:min-h-0"
      >
        <Store className="w-4 h-4" /> Tag a store
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-2 space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search stores and pantries…"
          className="h-9 pl-8 text-xs"
        />
      </div>
      <div className="max-h-52 overflow-y-auto space-y-0.5">
        {isLoading && <p className="text-xs text-muted-foreground px-2 py-2">Loading resources…</p>}
        {!isLoading && matches.length === 0 && (
          <p className="text-xs text-muted-foreground px-2 py-2">No matching resources.</p>
        )}
        {matches.map(r => {
          const cfg = TYPE_CONFIG[r.type] || TYPE_CONFIG.Convenience;
          return (
            <button
              key={r.id}
              onClick={() => { onChange({ id: r.id, name: r.name }); setQuery(""); setOpen(false); }}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted text-left transition-colors"
            >
              <span className="text-base shrink-0">{cfg.emoji}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs font-medium text-foreground truncate">{r.name}</span>
                {r.address && <span className="block text-[11px] text-muted-foreground truncate">{r.address}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => { setOpen(false); setQuery(""); }}
        className="w-full text-xs text-muted-foreground hover:text-foreground py-1"
      >
        Cancel
      </button>
    </div>
  );
}