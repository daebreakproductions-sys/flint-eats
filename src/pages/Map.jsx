import { useState, useMemo, useRef } from "react";
import { ChevronUp, ChevronDown, LocateFixed, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

const NEARBY_RADIUS_M = 3000; // 3 km

function FlyToLocation({ coords }) {
  const map = useMap();
  if (coords) map.flyTo(coords, 14, { animate: true, duration: 1.2 });
  return null;
}
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import MapFilters from "@/components/map/MapFilters";
import MapLegend, { TYPE_CONFIG } from "@/components/map/MapLegend";
import ResourcePopup from "@/components/map/ResourcePopup";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/lib/assets/MarkerCluster.css";
import "react-leaflet-cluster/lib/assets/MarkerCluster.Default.css";

const FLINT_CENTER = [43.0125, -83.6875];

export default function Map() {
  const [search, setSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState([]);
  const [activeBenefits, setActiveBenefits] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [legendOpen, setLegendOpen] = useState(true);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["food-resources"],
    queryFn: () => base44.entities.FoodResource.filter({ is_active: true }, "name", 1000),
  });

  const toggleType = (type) =>
    setActiveTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);

  const toggleBenefit = (benefit) =>
    setActiveBenefits(prev => prev.includes(benefit) ? prev.filter(b => b !== benefit) : [...prev, benefit]);

  const filtered = useMemo(() => {
    return resources.filter(r => {
      if (!r.lat || !r.lng) return false;
      if (activeTypes.length > 0 && !activeTypes.includes(r.type)) return false;
      if (activeBenefits.length > 0 && !activeBenefits.every(b => r[b])) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.name?.toLowerCase().includes(q) && !r.address?.toLowerCase().includes(q) && !r.notes?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [resources, activeTypes, activeBenefits, search]);

  return (
    <div className="relative h-[calc(100vh-64px)] md:h-[calc(100vh-64px)]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-[1000]">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
        </div>
      )}

      <MapContainer
        center={FLINT_CENTER}
        zoom={12}
        className="w-full h-full z-0"
        style={{ height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MarkerClusterGroup chunkedLoading>
          {filtered.map(resource => {
            const cfg = TYPE_CONFIG[resource.type] || TYPE_CONFIG.Other;
            const icon = L.divIcon({
              html: `<span style="font-size:22px;line-height:1;">${cfg.emoji}</span>`,
              className: "",
              iconSize: [28, 28],
              iconAnchor: [14, 14],
              popupAnchor: [0, -14],
            });
            return (
              <Marker
                key={resource.id}
                position={[resource.lat, resource.lng]}
                icon={icon}
              >
                <Popup maxWidth={280}>
                  <ResourcePopup resource={resource} />
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Filters panel */}
      <div className="absolute top-3 left-3 z-[500] max-w-sm" style={{ maxWidth: "360px" }}>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <span>Filters</span>
            {filtersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {filtersOpen && (
            <div className="border-t border-gray-100">
              <MapFilters
                search={search}
                setSearch={setSearch}
                activeTypes={activeTypes}
                toggleType={toggleType}
                activeBenefits={activeBenefits}
                toggleBenefit={toggleBenefit}
                resultCount={filtered.length}
              />
            </div>
          )}
        </div>
      </div>

      {/* Legend panel */}
      <div className="absolute bottom-16 md:bottom-4 right-3 z-[500]">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={() => setLegendOpen(o => !o)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <span>Legend</span>
            {legendOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {legendOpen && (
            <div className="border-t border-gray-100">
              <MapLegend />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}