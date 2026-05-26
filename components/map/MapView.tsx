"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { LocateFixed, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";
import { getCurrentPosition, type Coords } from "@/lib/geo";
import { vibrate } from "@/lib/photo";
import type { SpotWithAuthor } from "@/lib/types";
import { SpotMarker } from "./SpotMarker";
import { UserLocationMarker } from "./UserLocationMarker";
import { toast } from "sonner";

const LIGHT_TILES = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

interface MapViewProps {
  spots: SpotWithAuthor[];
  onSpotClick: (spot: SpotWithAuthor) => void;
}

export function MapView({ spots, onSpotClick }: MapViewProps) {
  const { resolvedTheme } = useTheme();
  const [userPos, setUserPos] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const handleLocate = useCallback(async () => {
    setLocating(true);
    vibrate(8);
    try {
      const pos = await getCurrentPosition();
      setUserPos(pos);
      mapRef.current?.flyTo([pos.lat, pos.lng], 16, { duration: 1.2 });
    } catch (err) {
      toast.error("Не удалось определить геолокацию", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLocating(false);
    }
  }, []);

  // Auto-locate once on mount (best-effort; user can decline)
  useEffect(() => {
    handleLocate().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={DEFAULT_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        zoomControl={false}
        ref={mapRef}
        className="h-full w-full"
        worldCopyJump
        preferCanvas
      >
        <TileLayer
          attribution={ATTRIBUTION}
          url={resolvedTheme === "dark" ? DARK_TILES : LIGHT_TILES}
          maxZoom={19}
        />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          showCoverageOnHover={false}
          spiderfyOnMaxZoom
        >
          {spots.map((spot) => (
            <SpotMarker key={spot.id} spot={spot} onClick={() => onSpotClick(spot)} />
          ))}
        </MarkerClusterGroup>

        {userPos && <UserLocationMarker lat={userPos.lat} lng={userPos.lng} />}
      </MapContainer>

      {/* Floating locate button */}
      <Button
        type="button"
        size="icon"
        variant="secondary"
        onClick={handleLocate}
        disabled={locating}
        className="absolute right-4 bottom-32 md:bottom-6 z-[400] h-12 w-12 rounded-full shadow-xl bg-card border"
        aria-label="Моя локация"
      >
        {locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}
      </Button>
    </div>
  );
}
