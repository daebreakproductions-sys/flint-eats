import { Phone, MapPin, Clock, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TYPE_CONFIG } from "@/components/map/MapLegend";
import ResourceReviews from "./ResourceReviews";

function normalizeUrl(url) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export default function ResourceDetailDialog({ resource, open, onOpenChange, user }) {
  if (!resource) return null;
  const cfg = TYPE_CONFIG[resource.type] || TYPE_CONFIG.Convenience;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-2">
            <span className="text-2xl">{cfg.emoji}</span>
            <div className="flex-1">
              <DialogTitle className="leading-tight">{resource.name}</DialogTitle>
              <Badge className="mt-1 text-white text-xs" style={{ backgroundColor: cfg.color }}>
                {cfg.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2 text-sm text-muted-foreground">
          {resource.address && (
            <div className="flex gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-green-700" />
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(resource.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:underline"
              >
                {resource.address}
              </a>
            </div>
          )}
          {resource.hours && (
            <div className="flex gap-2">
              <Clock className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="whitespace-pre-wrap">{resource.hours}</span>
            </div>
          )}
          {resource.phone && (
            <div className="flex gap-2">
              <Phone className="w-4 h-4 mt-0.5 shrink-0" />
              <a href={`tel:${resource.phone}`} className="text-green-700 hover:underline">{resource.phone}</a>
            </div>
          )}
          {normalizeUrl(resource.url) && (
            <div className="flex gap-2">
              <Globe className="w-4 h-4 mt-0.5 shrink-0" />
              <a href={normalizeUrl(resource.url)} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">Website</a>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {resource.ebt_accepted && <Badge className="bg-blue-100 text-blue-800 text-xs">EBT/SNAP</Badge>}
          {resource.dufb_offered && <Badge className="bg-orange-100 text-orange-800 text-xs">Double Up $</Badge>}
          {resource.wic_accepted && <Badge className="bg-purple-100 text-purple-800 text-xs">WIC</Badge>}
        </div>

        {resource.notes && <p className="text-xs text-muted-foreground border-t border-border pt-2">{resource.notes}</p>}

        <div className="border-t border-border pt-3">
          <ResourceReviews resourceId={resource.id} user={user} />
        </div>
      </DialogContent>
    </Dialog>
  );
}