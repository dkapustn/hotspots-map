"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapClient } from "@/components/map/MapClient";
import type { SpotWithAuthor } from "@/lib/types";
import { MapPin, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";
import { createClient } from "@/lib/supabase/client";
import { attachAuthor } from "@/lib/spot-helpers";
import { toast } from "sonner";

export function MapScreen({
  initialSpots,
  userId,
}: {
  initialSpots: SpotWithAuthor[];
  userId: string | null;
}) {
  const router = useRouter();
  const [spots, setSpots] = useState(initialSpots);
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
            .select("*, profiles!spots_user_id_fkey(id, username, avatar_url)")
            .eq("id", id)
            .maybeSingle();
          if (!data) return;
          const newSpot = attachAuthor(data as unknown as Parameters<typeof attachAuthor>[0]) as SpotWithAuthor;
          setSpots((prev) => (prev.some((s) => s.id === newSpot.id) ? prev : [newSpot, ...prev]));
          toast.message("Новое место рядом", {
            description: newSpot.title,
            action: { label: "Открыть", onClick: () => router.push(`/spot/${newSpot.id}`) },
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "spots" },
        (payload) => {
          const id = (payload.old as { id: string }).id;
          setSpots((prev) => prev.filter((s) => s.id !== id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  // Клик по метке — сразу открываем её страницу (без промежуточного попапа).
  const handleClick = useCallback(
    (spot: SpotWithAuthor) => router.push(`/spot/${spot.id}`),
    [router],
  );

  const filtered = query.trim()
    ? spots.filter((s) =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.author?.username?.toLowerCase().includes(query.toLowerCase()),
      )
    : spots;

  return (
    <div className="relative h-full w-full">
      <Onboarding />

      {/* Top bar (mobile) — Liquid Glass pills */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center gap-2 px-3 pt-[calc(env(safe-area-inset-top,0px)+0.625rem)] pb-2 md:hidden">
        {/* Левая группа скрывается, когда открыт поиск — чтобы он раскрылся
            на всю ширину и ничего не «съезжало». */}
        {!searchOpen && (
          <div className="pointer-events-auto flex items-center gap-2">
            <div className="glass-strong glass-shine flex h-10 items-center gap-2 rounded-full px-3.5">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">{APP_NAME}</span>
            </div>
            {userId && <NotificationsBell userId={userId} />}
          </div>
        )}

        {searchOpen ? (
          <div className="pointer-events-auto glass-strong glass-shine flex h-10 flex-1 items-center gap-1 rounded-full pl-3.5 pr-1">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск меток..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => {
                setSearchOpen(false);
                setQuery("");
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-foreground/10"
              aria-label="Закрыть поиск"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="glass-strong glass-shine pointer-events-auto ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            aria-label="Поиск"
          >
            <Search className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Desktop search — glass pill */}
      <div className="pointer-events-none absolute left-0 right-0 top-4 z-30 hidden md:flex justify-center px-4">
        <div className="pointer-events-auto glass-strong glass-shine flex items-center gap-2 rounded-full px-5 py-2.5 w-full max-w-md">
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
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-foreground/10 text-muted-foreground"
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

      {/* Desktop notifications bell — top-right */}
      {userId && (
        <div className="pointer-events-auto absolute right-4 top-4 z-30 hidden md:block">
          <NotificationsBell userId={userId} />
        </div>
      )}

      <MapClient spots={filtered} onSpotClick={handleClick} />

      {/* Empty hint */}
      {spots.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center px-4">
          <div className="pointer-events-auto glass-strong glass-shine max-w-sm rounded-3xl p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-500 text-white shadow-lg shadow-primary/30">
              <MapPin className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Здесь пока пусто</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
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
          <div className="pointer-events-auto glass-strong glass-shine rounded-full px-4 py-2 text-sm">
            Ничего не нашлось по «{query}»
          </div>
        </div>
      )}
    </div>
  );
}
