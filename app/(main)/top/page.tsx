import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { attachAuthor } from "@/lib/spot-helpers";
import { TopSearch } from "./top-search";
import type { SpotStatsWithAuthor } from "@/lib/types";

export const metadata: Metadata = { title: "Топ мест" };
export const dynamic = "force-dynamic";

async function fetchSpots(orderBy: "likes_count" | "visits_count" | "created_at") {
  const supabase = createClient();
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
  return stats.map((row) =>
    attachAuthor({
      ...(row as unknown as Parameters<typeof attachAuthor>[0]),
      profiles: byId.get(row.user_id) ?? null,
    }) as SpotStatsWithAuthor,
  );
}

export default async function TopPage() {
  const [byLikes, byVisits, recent] = await Promise.all([
    fetchSpots("likes_count"),
    fetchSpots("visits_count"),
    fetchSpots("created_at"),
  ]);

  return (
    <div className="h-full overflow-y-auto pb-safe-nav">
      <div className="mx-auto max-w-3xl px-4 md:px-8 pt-safe-content">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Топ мест</h1>
            <p className="text-sm text-muted-foreground">Самые любимые и посещаемые места.</p>
          </div>
        </div>

        <TopSearch byLikes={byLikes} byVisits={byVisits} recent={recent} />
      </div>
    </div>
  );
}
