"use client";
import { Marker } from "react-leaflet";
import L from "leaflet";
import { useMemo } from "react";
import type { SpotWithAuthor } from "@/lib/types";

interface Props {
  spot: SpotWithAuthor;
  onClick: () => void;
}

export function SpotMarker({ spot, onClick }: Props) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "spot-marker",
        html: `<div class="spot-marker-inner" style="background-image:url('${escapeUrl(
          spot.photo_url,
        )}')"></div>`,
        iconSize: [44, 50],
        iconAnchor: [22, 50],
      }),
    [spot.photo_url],
  );

  return (
    <Marker
      position={[spot.latitude, spot.longitude]}
      icon={icon}
      eventHandlers={{ click: onClick }}
    />
  );
}

function escapeUrl(url: string): string {
  return url.replace(/'/g, "%27");
}
