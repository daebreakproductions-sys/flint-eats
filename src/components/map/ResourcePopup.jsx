import { useState, useEffect } from "react";
import { Phone, MapPin, Clock, Globe, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TYPE_CONFIG } from "./MapLegend";
import { base44 } from "@/api/base44Client";
import StartMessageModal from "@/components/messages/StartMessageModal";

export default function ResourcePopup({ resource }) {
  const cfg = TYPE_CONFIG[resource.type] || TYPE_CONFIG.Other;
  const [user, setUser] = useState(null);
  const [showMsg, setShowMsg] = useState(false);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  return (
    <div className="w-64 text-sm">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-xl">{cfg.emoji}</span>
        <div>
          <p className="font-bold text-gray-900 leading-tight">{resource.name}</p>
          <Badge
            className="mt-0.5 text-white text-xs px-1.5 py-0"
            style={{ backgroundColor: cfg.color }}
          >
            {cfg.label}
          </Badge>
        </div>
      </div>

      {resource.address && (
        <div className="flex gap-1.5 text-gray-600 mt-1">
          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-700" />
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
        <div className="flex gap-1.5 text-gray-600 mt-1">
          <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span className="whitespace-pre-wrap">{resource.hours}</span>
        </div>
      )}
      {resource.phone && (
        <div className="flex gap-1.5 text-gray-600 mt-1">
          <Phone className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <a href={`tel:${resource.phone}`} className="text-green-700 hover:underline">{resource.phone}</a>
        </div>
      )}
      {resource.url && (
        <div className="flex gap-1.5 text-gray-600 mt-1">
          <Globe className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline truncate">Website</a>
        </div>
      )}

      <div className="flex flex-wrap gap-1 mt-2">
        {resource.ebt_accepted && <Badge className="bg-blue-100 text-blue-800 text-xs">EBT/SNAP</Badge>}
        {resource.dufb_offered && <Badge className="bg-orange-100 text-orange-800 text-xs">Double Up $</Badge>}
        {resource.wic_accepted && <Badge className="bg-purple-100 text-purple-800 text-xs">WIC</Badge>}
      </div>

      {resource.notes && (
        <p className="mt-2 text-xs text-gray-500 border-t pt-1">{resource.notes}</p>
      )}

      {user && (
        <div className="mt-3 pt-2 border-t">
          <Button
            size="sm"
            className="w-full bg-green-700 hover:bg-green-800 h-8 text-xs"
            onClick={() => setShowMsg(true)}
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Message this Organization
          </Button>
        </div>
      )}

      {showMsg && user && (
        <StartMessageModal resource={resource} user={user} open={showMsg} onClose={() => setShowMsg(false)} />
      )}
    </div>
  );
}