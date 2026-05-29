import { createClient } from "@/lib/supabase/server";
import { attachAuthor } from "@/lib/spot-helpers";
import { MapScreen } from "./map-screen";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();
  const [{ data }, { data: { user } }] = await Promise.all([
    supabase
      .from("spots")
      .select("*, profiles!spots_user_id_fkey(id, username, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.auth.getUser(),
  ]);

  const spots = (data ?? []).map((row) => attachAuthor(row as any));
  return <MapScreen initialSpots={spots} userId={user?.id ?? null} />;
}
