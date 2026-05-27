import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { attachAuthor } from "@/lib/spot-helpers";
import { SpotDetail } from "./spot-detail";

export const dynamic = "force-dynamic";

export default async function SpotPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: spot }, statsRes, userLikeRes, userVisitRes, commentsRes] = await Promise.all([
    supabase
      .from("spots")
      .select("*, profiles!spots_user_id_fkey(id, username, avatar_url)")
      .eq("id", params.id)
      .maybeSingle(),
    supabase
      .from("spot_stats")
      .select("likes_count, visits_count, comments_count")
      .eq("id", params.id)
      .maybeSingle(),
    user
      ? supabase
          .from("likes")
          .select("user_id")
          .eq("user_id", user.id)
          .eq("spot_id", params.id)
          .maybeSingle()
      : Promise.resolve({ data: null } as any),
    user
      ? supabase
          .from("visits")
          .select("id")
          .eq("user_id", user.id)
          .eq("spot_id", params.id)
          .maybeSingle()
      : Promise.resolve({ data: null } as any),
    supabase
      .from("comments")
      .select("*, profiles!comments_user_id_fkey(id, username, avatar_url)")
      .eq("spot_id", params.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (!spot) notFound();

  const withAuthor = attachAuthor(spot as any);
  const stats = statsRes.data ?? { likes_count: 0, visits_count: 0, comments_count: 0 };

  return (
    <SpotDetail
      spot={withAuthor}
      stats={stats}
      initialLiked={!!userLikeRes.data}
      initialVisited={!!userVisitRes.data}
      initialComments={(commentsRes.data ?? []) as any}
      currentUserId={user?.id ?? null}
    />
  );
}
