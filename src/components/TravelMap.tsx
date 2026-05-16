"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

interface MapDestination {
  id: number;
  name: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  status: string;
  tagline: string | null;
  visitedAt: string | null;
}

interface TravelMapProps {
  destinations: MapDestination[];
}

// Custom marker icons
const visitedIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:hsl(350,70%,65%);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const wishlistIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:transparent;border:2px dashed hsl(350,70%,65%);opacity:0.7"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export function TravelMap({ destinations }: TravelMapProps) {
  const router = useRouter();
  const [mapType, setMapType] = useState<"china" | "world">("china");

  const chinaCenter: [number, number] = [35, 105];
  const worldCenter: [number, number] = [20, 0];
  const center = mapType === "china" ? chinaCenter : worldCenter;
  const zoom = mapType === "china" ? 4 : 2;

  const markers = destinations.filter((d) => d.lat != null && d.lng != null);

  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">足迹地图</span>
        <div className="flex gap-1">
          <button
            onClick={() => setMapType("china")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
              mapType === "china" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            中国
          </button>
          <button
            onClick={() => setMapType("world")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
              mapType === "world" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            世界
          </button>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ height: 360 }}>
        <MapContainer
          center={center}
          zoom={zoom}
          className="w-full h-full"
          scrollWheelZoom={true}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapController center={center} zoom={zoom} />

          {markers.map((d) => {
            const isVisited = d.status === "visited";
            return (
              <Marker
                key={d.id}
                position={[d.lat!, d.lng!]}
                icon={isVisited ? visitedIcon : wishlistIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-medium">{d.name}</p>
                    <p className={isVisited ? "text-emerald-600 text-xs" : "text-blue-600 text-xs"}>
                      {isVisited ? "已去过" : "想去"}
                    </p>
                    {d.tagline && <p className="text-xs text-muted-foreground mt-0.5">{d.tagline}</p>}
                    <button
                      onClick={() => router.push(`/travel/${d.id}`)}
                      className="text-xs text-primary mt-1 hover:underline"
                    >
                      查看详情 →
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-primary opacity-80 inline-block" />
          已去过
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-full border border-dashed border-primary opacity-60 inline-block" />
          想去
        </span>
      </div>
    </div>
  );
}
