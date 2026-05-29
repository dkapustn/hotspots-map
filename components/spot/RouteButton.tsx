"use client";
import { Navigation } from "lucide-react";
import { vibrate } from "@/lib/photo";

/**
 * «Проложить маршрут» — открывает родное приложение карт телефона
 * и строит маршрут к координатам метки.
 * iOS → Apple Maps, остальные → Google Maps.
 */
export function RouteButton({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label?: string;
}) {
  function openRoute() {
    vibrate(6);
    const isApple =
      typeof navigator !== "undefined" &&
      /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) &&
      !/Android/.test(navigator.userAgent);

    const url = isApple
      ? `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={openRoute}
      className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted/50 active:scale-[0.99]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Navigation className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">Проложить маршрут</span>
        {label ? (
          <span className="block text-xs text-muted-foreground">{label}</span>
        ) : null}
      </span>
    </button>
  );
}
