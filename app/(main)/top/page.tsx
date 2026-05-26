import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Footprints, MessageCircle, Sparkles, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { attachAuthor } from "@/lib/spot-helpers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials, formatRelativeTime } from "@/lib/utils";
import type { SpotStatsWithAuthor } from "@/lib/types";

export const metadata: Metadata = { title: "Топ мест" };
export const dynamic = "force-dynamic";

async function fetchSpots(orderBy: "likes_count" | "visits_count" | "created_at") {
  const supabase = createClient();
  // spot_stats view + join profiles by user_id via secondary lookup
  const { data: stats } = await supabase
    .from("spot_stats")
    .select("*")
    .order(orderBy, { ascending: false })
    .limit(30);

  if (!stats || stats.length === 0) return [] as SpotStatsWithAuthor[];

  const userIds = Array.from(new Set(stats.map((s) => s.user_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", userIds);

  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
  return stats.map((row) => attachAuthor({ ...(row as any), profiles: byId.get(row.user_id) ?? null }));
}

export default async function TopPage() {
  const [byLikes, byVisits, recent] = await Promise.all([
    fetchSpots("likes_count"),
    fetchSpots("visits_count"),
    fetchSpots("created_at"),
  ]);

  return (
    <div className="h-full overflow-y-auto pb-24 md:pb-8">
      <div className="mx-auto max-w-3xl px-4 pt-6 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Топ мест</h1>
            <p className="text-sm text-muted-foreground">Самые любимые и посещаемые места.</p>
          </div>
        </div>

        <Tabs defaultValue="likes" className="mt-6">
          <TabsList>
            <TabsTrigger value="likes"><Heart className="h-4 w-4" />Лайки</TabsTrigger>
            <TabsTrigger value="visits"><Footprints className="h-4 w-4" />Визиты</TabsTrigger>
            <TabsTrigger value="new"><Sparkles className="h-4 w-4" />Новые</TabsTrigger>
          </TabsList>
          <TabsContent value="likes"><SpotsGrid spots={byLikes} sortKey="likes" /></TabsContent>
          <TabsContent value="visits"><SpotsGrid spots={byVisits} sortKey="visits" /></TabsContent>
          <TabsContent value="new"><SpotsGrid spots={recent} sortKey="recent" /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SpotsGrid({ spots, sortKey }: { spots: SpotStatsWithAuthor[]; sortKey: "likes" | "visits" | "recent" }) {
  if (spots.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">Здесь пока пусто. Создайте первую метку!</p>
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
          {idx < 3 && sortKey !== "recent" && (
            <span className="absolute left-3 top-3 inline-flex h-7 items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 px-3 text-xs font-bold text-white shadow-lg">
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
