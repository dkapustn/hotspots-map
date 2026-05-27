"use client";
import { useEffect, useState } from "react";
import { Navigation } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentPosition, haversineMeters, formatDistance } from "@/lib/geo";

export function DistanceBadge({ lat, lng }: { lat: number; lng: number }) {
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCurrentPosition({ enableHighAccuracy: false, timeout: 6000, maximumAge: 60_000 })
      .then((pos) => {
        if (cancelled) return;
        setDistance(haversineMeters(pos.lat, pos.lng, lat, lng));
      })
      .catch(() => {
        if (cancelled) return;
        setDenied(true);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  if (denied) return null;

  return (
    <div className="inline-flex h-7 items-center gap-1.5 rounded-full bg-sky-500/10 px-3 text-xs font-medium text-sky-600 dark:text-sky-400">
      <Navigation className="h-3.5 w-3.5" />
      {loading ? <Skeleton className="h-3 w-12 rounded bg-sky-500/20" /> : <>в {formatDistance(distance ?? 0)} от вас</>}
    </div>
  );
}
