"use client";
import { Marker } from "react-leaflet";
import L from "leaflet";
import { useMemo } from "react";

export function UserLocationMarker({ lat, lng }: { lat: number; lng: number }) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "spot-marker",
        html: `<div class="user-location-marker"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
    [],
  );
  return <Marker position={[lat, lng]} icon={icon} interactive={false} />;
}
