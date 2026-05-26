import { createClient } from "@/lib/supabase/server";
import { attachAuthor } from "@/lib/spot-helpers";
import { MapScreen } from "./map-screen";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("spots")
    .select("*, profiles(id, username, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(500);

  const spots = (data ?? []).map((row) => attachAuthor(row as any));
  return <MapScreen initialSpots={spots} />;
}
