import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, LocateFixed, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { base44 } from "@/api/base44Client";
import MapFilters from "@/components/map/MapFilters";
import MapLegend, { TYPE_CONFIG } from "@/components/map/MapLegend";
import ResourcePopup from "@/components/map/ResourcePopup";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/lib/assets/MarkerCluster.css";
import "react-leaflet-cluster/lib/assets/MarkerCluster.Default.css";

const NEARBY_RADIUS_M = 3000;
const FLINT_CENTER = [43.0125, -83.6875];

function distanceMeter(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function MapInitializer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 500);
  }, [map]);
  return null;
}

function FlyToLocation({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (!Array.isArray(coords) || coords.length < 2) return;
    const lat = Number(coords[0]);
    const lng = Number(coords[1]);
    if (!isFinite(lat) || !isFinite(lng)) return;
    map.flyTo([lat, lng], 14, { animate: true, duration: 1.2 });
  }, [coords, map]);
  return null;
}

export default function MapPage() {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState([]);
  const [activeBenefits, setActiveBenefits] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [legendOpen, setLegendOpen] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(null);
  // Load resources once on mount
  useEffect(() => {
    base44.entities.FoodResource.filter({ is_active: true }, "name", 2000)
      .then(raw => {
        const clean = raw.map(r => ({
          id: r.id,
          name: r.name,
          address: r.address,
          phone: r.phone,
          lat: r.lat,
          lng: r.lng,
          type: r.type,
          hours: r.hours,
          notes: r.notes,
          ebt_accepted: r.ebt_accepted,
          dufb_offered: r.dufb_offered,
          wic_accepted: r.wic_accepted,
          email: r.email,
          url: r.url,
          image_url: r.image_url,
          source_id: r.source_id,
          is_active: r.is_active,
        }));
        // Deduplicate by source_id or id
        const seen = new globalThis.Map();
        for (const r of clean) {
          const key = r.source_id || r.id;
          if (!seen.has(key)) seen.set(key, r);
        }
        setResources(Array.from(seen.values()));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const toggleType = (type) =>
    setActiveTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);

  const toggleBenefit = (benefit) =>
    setActiveBenefits(prev => prev.includes(benefit) ? prev.filter(b => b !== benefit) : [...prev, benefit]);

  const handleLocate = () => {
    if (!navigator.geolocation) { setLocError("Geolocation not supported."); return; }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = Number(pos.coords.latitude);
        const lng = Number(pos.coords.longitude);
        if (isFinite(lat) && isFinite(lng)) setUserLocation([lat, lng]);
        setLocating(false);
      },
      () => { setLocError("Could not get your location."); setLocating(false); }
    );
  };

  // Plain filtering — no useMemo
  const filtered = resources.filter(r => {
    if (!r.lat || !r.lng) return false;
    if (activeTypes.length > 0 && !activeTypes.includes(r.type)) return false;
    if (activeBenefits.length > 0 && !activeBenefits.every(b => r[b])) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.name?.toLowerCase().includes(q) && !r.address?.toLowerCase().includes(q) && !r.notes?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const nearbyIds = userLocation
    ? new Set(
        resources
          .filter(r => r.lat && r.lng && distanceMeter(userLocation[0], userLocation[1], r.lat, r.lng) <= NEARBY_RADIUS_M)
          .map(r => r.id)
      )
    : null;

  return (
    <div className="relative h-[calc(100vh-128px)] md:h-[calc(100vh-64px)]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-[1000]">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
        </div>
      )}

      <MapContainer
        center={FLINT_CENTER}
        zoom={12}
        className="w-full h-full z-0"
        style={{ height: "100%", width: "100%" }}
      >
        <MapInitializer />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {userLocation && <FlyToLocation coords={userLocation} />}
        {userLocation && (
          <>
            <Circle center={userLocation} radius={NEARBY_RADIUS_M} pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 0.08, weight: 1.5, dashArray: "6 4" }} />
            <Marker
              position={userLocation}
              icon={L.divIcon({
                html: `<div style="width:14px;height:14px;background:#16a34a;border:3px solid white;border-radius:50%;box-shadow:0 0 0 3px #16a34a55;"></div>`,
                className: "",
                iconSize: [14, 14],
                iconAnchor: [7, 7],
              })}
            >
              <Popup>📍 Your location</Popup>
            </Marker>
          </>
        )}
        <MarkerClusterGroup chunkedLoading>
          {filtered.map(resource => {
            const cfg = TYPE_CONFIG[resource.type] || TYPE_CONFIG.Other;
            const isNearby = nearbyIds && nearbyIds.has(resource.id);
            const icon = L.divIcon({
              html: `<span style="font-size:22px;line-height:1;${isNearby ? "filter:drop-shadow(0 0 4px #16a34a);" : `opacity:${nearbyIds ? 0.45 : 1};`}">${cfg.emoji}</span>`,
              className: "",
              iconSize: [28, 28],
              iconAnchor: [14, 14],
              popupAnchor: [0, -14],
            });
            return (
              <Marker key={resource.id} position={[resource.lat, resource.lng]} icon={icon}>
                <Popup maxWidth={280}>
                  <ResourcePopup resource={resource} />
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Find My Location button */}
      <div className="absolute top-3 right-3 z-[500]">
        <button
          onClick={handleLocate}
          disabled={locating}
          className="flex items-center gap-2 bg-white rounded-xl shadow-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
        >
          {locating ? <Loader2 className="w-4 h-4 animate-spin text-green-700" /> : <LocateFixed className="w-4 h-4 text-green-700" />}
          {locating ? "Locating…" : "Find My Location"}
        </button>
        {locError && <p className="mt-1 text-xs text-red-500 bg-white rounded-lg px-2 py-1 shadow">{locError}</p>}
        {userLocation && !locating && (
          <p className="mt-1 text-xs text-green-700 bg-white rounded-lg px-2 py-1 shadow">
            {nearbyIds?.size ?? 0} resources within 3 km
          </p>
        )}
      </div>

      {/* Filters panel */}
      <div className="absolute top-3 left-3 z-[500]" style={{ maxWidth: "360px" }}>
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