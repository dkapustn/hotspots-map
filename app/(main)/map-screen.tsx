"use client";
import { useCallback, useState } from "react";
import { MapClient } from "@/components/map/MapClient";
import { SpotBottomSheet } from "@/components/spot/SpotBottomSheet";
import type { SpotWithAuthor } from "@/lib/types";
import { MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export function MapScreen({ initialSpots }: { initialSpots: SpotWithAuthor[] }) {
  const [spots] = useState(initialSpots);
  const [selected, setSelected] = useState<SpotWithAuthor | null>(null);

  const handleClick = useCallback((spot: SpotWithAuthor) => setSelected(spot), []);
  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <div className="relative h-full w-full">
      {/* App brand on mobile (above map) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-safe pb-2 md:hidden">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-card/90 px-3 py-1.5 shadow-md backdrop-blur">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{APP_NAME}</span>
        </div>
      </div>

      <MapClient spots={spots} onSpotClick={handleClick} />

      {/* Empty hint when no spots in the world */}
      {spots.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center px-4">
          <div className="pointer-events-auto max-w-sm rounded-2xl border bg-card/95 p-5 text-center shadow-2xl backdrop-blur">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-3 text-base font-semibold">Здесь пока пусто</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Станьте первым и поделитесь крутым местом!
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href="/create">
                <Plus className="h-4 w-4" /> Добавить метку
              </Link>
            </Button>
          </div>
        </div>
      )}

      <SpotBottomSheet spot={selected} open={!!selected} onClose={handleClose} />
    </div>
  );
}
