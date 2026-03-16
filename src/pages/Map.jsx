import { useState, useMemo } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
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
  const [panelOpen, setPanelOpen] = useState(true);

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
            return (
              <CircleMarker
                key={resource.id}
                center={[resource.lat, resource.lng]}
                radius={8}
                pathOptions={{
                  fillColor: cfg.color,
                  fillOpacity: 0.85,
                  color: "#fff",
                  weight: 1.5,
                }}
              >
                <Popup maxWidth={280}>
                  <ResourcePopup resource={resource} />
                </Popup>
              </CircleMarker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Toggle button */}
      <button
        onClick={() => setPanelOpen(o => !o)}
        className="absolute top-3 right-3 z-[600] bg-white rounded-full shadow-md p-2 hover:bg-gray-50 transition"
        title={panelOpen ? "Hide filters" : "Show filters"}
      >
        {panelOpen ? <PanelLeftClose className="w-5 h-5 text-gray-600" /> : <PanelLeftOpen className="w-5 h-5 text-gray-600" />}
      </button>

      {/* Overlay controls */}
      {panelOpen && (
        <>
          <div className="absolute top-3 left-3 z-[500] max-w-sm" style={{ right: "3.5rem" }}>
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
          <div className="absolute bottom-16 md:bottom-4 right-3 z-[500]">
            <MapLegend />
          </div>
        </>
      )}
    </div>
  );
}