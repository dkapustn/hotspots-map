"use client";
import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Footprints, MessageCircle, Sparkles, Star, Search, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials, formatRelativeTime } from "@/lib/utils";
import type { SpotStatsWithAuthor } from "@/lib/types";

export function TopSearch({
  byRating,
  byLikes,
  byVisits,
  recent,
}: {
  byRating: SpotStatsWithAuthor[];
  byLikes: SpotStatsWithAuthor[];
  byVisits: SpotStatsWithAuthor[];
  recent: SpotStatsWithAuthor[];
}) {
  const [query, setQuery] = useState("");

  const filterSpots = useCallback(
    (spots: SpotStatsWithAuthor[]) => {
      const q = query.trim().toLowerCase();
      if (!q) return spots;
      return spots.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.author?.username?.toLowerCase().includes(q),
      );
    },
    [query],
  );

  const filteredRating = useMemo(() => filterSpots(byRating), [byRating, filterSpots]);
  const filteredLikes = useMemo(() => filterSpots(byLikes), [byLikes, filterSpots]);
  const filteredVisits = useMemo(() => filterSpots(byVisits), [byVisits, filterSpots]);
  const filteredRecent = useMemo(() => filterSpots(recent), [recent, filterSpots]);

  return (
    <>
      <div className="mt-6 flex items-center gap-2 rounded-2xl border bg-card px-4 py-2.5 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по названию или автору..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            aria-label="Очистить"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <Tabs defaultValue="rating" className="mt-4">
        <TabsList>
          <TabsTrigger value="rating"><Star className="h-4 w-4" />Рейтинг</TabsTrigger>
          <TabsTrigger value="likes"><Heart className="h-4 w-4" />Лайки</TabsTrigger>
          <TabsTrigger value="visits"><Footprints className="h-4 w-4" />Визиты</TabsTrigger>
          <TabsTrigger value="new"><Sparkles className="h-4 w-4" />Новые</TabsTrigger>
        </TabsList>
        <TabsContent value="rating">
          <SpotsGrid spots={filteredRating} showRank />
        </TabsContent>
        <TabsContent value="likes">
          <SpotsGrid spots={filteredLikes} showRank />
        </TabsContent>
        <TabsContent value="visits">
          <SpotsGrid spots={filteredVisits} showRank />
        </TabsContent>
        <TabsContent value="new">
          <SpotsGrid spots={filteredRecent} showRank={false} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function SpotsGrid({ spots, showRank }: { spots: SpotStatsWithAuthor[]; showRank: boolean }) {
  if (spots.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">Ничего не нашлось.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {spots.map((s, idx) => (
        <Link
          key={s.id}
          href={`/spot/${s.id}`}
          className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-xl hover:-translate-y-0.5"
        >
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img
              src={s.photo_url}
              alt={s.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          {showRank && idx < 3 && (
            <span className="absolute left-3 top-3 inline-flex h-7 items-center rounded-full bg-gradient-to-br from-primary to-primary/70 px-3 text-xs font-bold text-primary-foreground shadow-lg">
              #{idx + 1}
            </span>
          )}
          <div className="p-4">
            <h3 className="line-clamp-1 font-semibold">{s.title}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Avatar className="h-5 w-5">
                {s.author?.avatar_url ? <AvatarImage src={s.author.avatar_url} alt="" /> : null}
                <AvatarFallback className="text-[9px]">{initials(s.author?.username)}</AvatarFallback>
              </Avatar>
              <span>{s.author?.username ?? "—"}</span>
              <span>·</span>
              <span>{formatRelativeTime(s.created_at)}</span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              {s.ratings_count > 0 && (
                <span className="inline-flex items-center gap-1 font-medium text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-500" /> {Number(s.avg_rating).toFixed(1)}
                </span>
              )}
              <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {s.likes_count}</span>
              <span className="inline-flex items-center gap-1"><Footprints className="h-3.5 w-3.5" /> {s.visits_count}</span>
              <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {s.comments_count}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
