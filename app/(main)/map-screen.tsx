"use client";
import { useCallback, useEffect, useState } from "react";
import { MapClient } from "@/components/map/MapClient";
import { SpotBottomSheet } from "@/components/spot/SpotBottomSheet";
import type { SpotWithAuthor } from "@/lib/types";
import { MapPin, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { createClient } from "@/lib/supabase/client";
import { attachAuthor } from "@/lib/spot-helpers";
import { toast } from "sonner";

export function MapScreen({ initialSpots }: { initialSpots: SpotWithAuthor[] }) {
  const [spots, setSpots] = useState(initialSpots);
  const [selected, setSelected] = useState<SpotWithAuthor | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Realtime: append new spots as they appear
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("spots-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "spots" },
        async (payload) => {
          const id = (payload.new as { id: string }).id;
          if (!id) return;
          const { data } = await supabase
            .from("spots")
            .select("*, profiles(id, username, avatar_url)")
            .eq("id", id)
            .maybeSingle();
          if (!data) return;
          const newSpot = attachAuthor(data as unknown as Parameters<typeof attachAuthor>[0]) as SpotWithAuthor;
          setSpots((prev) => (prev.some((s) => s.id === newSpot.id) ? prev : [newSpot, ...prev]));
          toast.message("Новое место рядом", {
            description: newSpot.title,
            action: { label: "Открыть", onClick: () => setSelected(newSpot) },
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "spots" },
        (payload) => {
          const id = (payload.old as { id: string }).id;
          setSpots((prev) => prev.filter((s) => s.id !== id));
          setSelected((cur) => (cur?.id === id ? null : cur));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleClick = useCallback((spot: SpotWithAuthor) => setSelected(spot), []);
  const handleClose = useCallback(() => setSelected(null), []);

  const filtered = query.trim()
    ? spots.filter((s) =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.author?.username?.toLowerCase().includes(query.toLowerCase()),
      )
    : spots;

  return (
    <div className="relative h-full w-full">
      <Onboarding />

      {/* Top bar (mobile) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-4 pt-safe pb-2 md:hidden">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-card/90 px-3 py-1.5 shadow-md backdrop-blur">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{APP_NAME}</span>
        </div>
        <div className="pointer-events-auto">
          {searchOpen ? (
            <div className="flex items-center gap-1 rounded-full bg-card/95 pl-3 pr-1 py-1 shadow-md backdrop-blur w-[60vw] max-w-[260px]">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск меток..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted shrink-0"
                aria-label="Закрыть"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card/90 shadow-md backdrop-blur"
              aria-label="Поиск"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop search */}
      <div className="pointer-events-none absolute left-0 right-0 top-4 z-30 hidden md:flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-card/95 px-4 py-2 shadow-xl backdrop-blur w-full max-w-md border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск меток по названию или автору..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted text-muted-foreground"
              aria-label="Очистить"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <div className="text-xs text-muted-foreground tabular-nums">
            {filtered.length}/{spots.length}
          </div>
        </div>
      </div>

      <MapClient spots={filtered} onSpotClick={handleClick} />

      {/* Empty hint */}
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

      {/* No search results */}
      {spots.length > 0 && filtered.length === 0 && query.trim() && (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center px-4">
          <div className="pointer-events-auto rounded-xl border bg-card/95 px-4 py-2 text-sm shadow-md backdrop-blur">
            Ничего не нашлось по «{query}»
          </div>
        </div>
      )}

      <SpotBottomSheet spot={selected} open={!!selected} onClose={handleClose} />
    </div>
  );
}
