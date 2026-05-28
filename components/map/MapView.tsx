"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { LocateFixed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";
import { getCurrentPosition, type Coords } from "@/lib/geo";
import { vibrate } from "@/lib/photo";
import {
  MAP_STYLE_CHANGE_EVENT,
  getMapStyle,
  getStoredMapStyle,
  type MapStyleId,
} from "@/lib/map-styles";
import type { SpotWithAuthor } from "@/lib/types";
import { SpotMarker } from "./SpotMarker";
import { UserLocationMarker } from "./UserLocationMarker";
import { toast } from "sonner";

interface MapViewProps {
  spots: SpotWithAuthor[];
  onSpotClick: (spot: SpotWithAuthor) => void;
  flyToSpot?: SpotWithAuthor | null;
}

const VIEW_STORAGE_KEY = "hotspots:map-view:v1";

export function MapView({ spots, onSpotClick, flyToSpot }: MapViewProps) {
  const [userPos, setUserPos] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const hasAutoLocated = useRef(false);

  // Стиль карты — реактивно подхватываем смену из настроек.
  const [styleId, setStyleId] = useState<MapStyleId>("voyager");
  useEffect(() => {
    setStyleId(getStoredMapStyle());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<MapStyleId>).detail;
      if (detail) setStyleId(detail);
    };
    window.addEventListener(MAP_STYLE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(MAP_STYLE_CHANGE_EVENT, onChange);
  }, []);
  const tileUrl = getMapStyle(styleId).url;

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

  // Auto-locate once on mount IF нет сохранённой позиции (best-effort).
  useEffect(() => {
    if (hasAutoLocated.current) return;
    hasAutoLocated.current = true;

    const saved = sessionStorage.getItem(VIEW_STORAGE_KEY);
    if (!saved) {
      handleLocate().catch(() => {});
    }
  }, [handleLocate]);

  // Восстанавливаем сохранённую позицию карты + сохраняем при движении.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Restore
    const saved = sessionStorage.getItem(VIEW_STORAGE_KEY);
    if (saved) {
      try {
        const { lat, lng, zoom } = JSON.parse(saved) as {
          lat: number;
          lng: number;
          zoom: number;
        };
        if (
          Number.isFinite(lat) &&
          Number.isFinite(lng) &&
          Number.isFinite(zoom)
        ) {
          map.setView([lat, lng], zoom, { animate: false });
        }
      } catch {
        /* ignore corrupted state */
      }
    }

    // Save on move/zoom (debounced via single moveend)
    const save = () => {
      const c = map.getCenter();
      const z = map.getZoom();
      sessionStorage.setItem(
        VIEW_STORAGE_KEY,
        JSON.stringify({ lat: c.lat, lng: c.lng, zoom: z }),
      );
    };
    map.on("moveend", save);
    return () => {
      map.off("moveend", save);
    };
  }, []);

  // Smooth fly-to when внешний код просит сфокусироваться на метке.
  useEffect(() => {
    if (!flyToSpot || !mapRef.current) return;
    const targetZoom = Math.max(mapRef.current.getZoom(), 16);
    mapRef.current.flyTo([flyToSpot.latitude, flyToSpot.longitude], targetZoom, {
      duration: 0.9,
    });
  }, [flyToSpot]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={DEFAULT_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        zoomControl={false}
        attributionControl={false}
        ref={mapRef}
        className="h-full w-full"
        worldCopyJump
        preferCanvas
      >
        <TileLayer key={styleId} url={tileUrl} maxZoom={19} />

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

      {/* Locate button над простым BottomNav (h-14 = 56px + safe-area). */}
      <Button
        type="button"
        size="icon"
        variant="secondary"
        onClick={handleLocate}
        disabled={locating}
        className="absolute right-4 z-[600] h-11 w-11 rounded-full border bg-card shadow-lg md:bottom-6"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 4.5rem)" }}
        aria-label="Моя локация"
      >
        {locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}
      </Button>
    </div>
  );
}
