"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { SpotWithAuthor } from "@/lib/types";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/30">
      <Skeleton className="h-full w-full" />
    </div>
  ),
});

export function MapClient(props: {
  spots: SpotWithAuthor[];
  onSpotClick: (s: SpotWithAuthor) => void;
  flyToSpot?: SpotWithAuthor | null;
}) {
  return <MapView {...props} />;
}
