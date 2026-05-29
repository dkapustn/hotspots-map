import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { attachAuthor } from "@/lib/spot-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ShareProfileButton } from "@/components/profile/ShareProfileButton";
import { SpotCardGrid } from "@/components/profile/SpotCardGrid";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: spots }, { data: visits }, { data: likes }, { data: bookmarks }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("spots")
      .select("*, profiles!spots_user_id_fkey(id, username, avatar_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("visits")
      .select("spot_id, visited_at, spots!visits_spot_id_fkey(*, profiles!spots_user_id_fkey(id, username, avatar_url))")
      .eq("user_id", user.id)
      .order("visited_at", { ascending: false }),
    supabase
      .from("likes")
      .select("spot_id, created_at, spots!likes_spot_id_fkey(*, profiles!spots_user_id_fkey(id, username, avatar_url))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("bookmarks")
      .select("spot_id, created_at, spots!bookmarks_spot_id_fkey(*, profiles!spots_user_id_fkey(id, username, avatar_url))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const mySpots = (spots ?? []).map((s) => attachAuthor(s as any));
  const visited = (visits ?? [])
    .map((v: any) => (v.spots ? attachAuthor(v.spots) : null))
    .filter(Boolean) as ReturnType<typeof attachAuthor>[];
  const liked = (likes ?? [])
    .map((l: any) => (l.spots ? attachAuthor(l.spots) : null))
    .filter(Boolean) as ReturnType<typeof attachAuthor>[];
  const bookmarked = (bookmarks ?? [])
    .map((b: any) => (b.spots ? attachAuthor(b.spots) : null))
    .filter(Boolean) as ReturnType<typeof attachAuthor>[];

  // Общее число лайков, полученных на всех метках пользователя.
  let likesReceived = 0;
  if (mySpots.length > 0) {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .in("spot_id", mySpots.map((s) => s.id));
    likesReceived = count ?? 0;
  }

  const [followersCountRes, followingCountRes, friendsRes] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("followee_id", user.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id),
    supabase.from("friendships").select("user1_id, user2_id"),
  ]);
  const followersCount = followersCountRes.count ?? 0;
  const followingCount = followingCountRes.count ?? 0;
  const friendsCount = (friendsRes.data ?? []).filter(
    (f) => f.user1_id === user.id || f.user2_id === user.id,
  ).length;

  return (
    <div className="h-full scroll-area pb-safe-nav">
      <div className="mx-auto max-w-2xl px-4 md:px-8 pt-safe-content">
        {/* ── Centered header ── */}
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-b from-primary/10 to-card p-6">
          <ShareProfileButton
            userId={user.id}
            username={profile?.username ?? ""}
            iconOnly
            className="absolute right-4 top-4 z-10 bg-background/60 backdrop-blur"
          />

          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
              {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
              <AvatarFallback className="text-2xl">{initials(profile?.username)}</AvatarFallback>
            </Avatar>

            <h1 className="mt-4 text-2xl font-bold">{profile?.username ?? "—"}</h1>
            {profile?.bio ? (
              <p className="mt-1.5 max-w-sm text-sm text-foreground/80">{profile.bio}</p>
            ) : (
              <p className="mt-1.5 text-sm italic text-muted-foreground">Без описания</p>
            )}
          </div>

          <div className="mt-6 border-t pt-5">
            <ProfileStats
              userId={user.id}
              spots={mySpots.length}
              visited={visited.length}
              likes={likesReceived}
              followers={followersCount}
              following={followingCount}
              friends={friendsCount}
            />
          </div>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="mine" className="mt-6">
          <TabsList>
            <TabsTrigger value="mine" className="px-1 text-xs sm:text-sm">Мои</TabsTrigger>
            <TabsTrigger value="visited" className="px-1 text-xs sm:text-sm">Посещённые</TabsTrigger>
            <TabsTrigger value="liked" className="px-1 text-xs sm:text-sm">Лайки</TabsTrigger>
            <TabsTrigger value="saved" className="px-1 text-xs sm:text-sm">Закладки</TabsTrigger>
          </TabsList>

          <TabsContent value="mine">
            {mySpots.length === 0 ? (
              <EmptyState message="Вы ещё не создали ни одной метки.">
                <Button asChild className="mt-3"><Link href="/create"><Plus className="h-4 w-4" /> Создать</Link></Button>
              </EmptyState>
            ) : (
              <SpotCardGrid spots={mySpots} />
            )}
          </TabsContent>
          <TabsContent value="visited">
            {visited.length === 0 ? (
              <EmptyState message="Вы ещё никого не посещали. Откройте карту!" />
            ) : (
              <SpotCardGrid spots={visited} showAuthor />
            )}
          </TabsContent>
          <TabsContent value="liked">
            {liked.length === 0 ? (
              <EmptyState message="Лайкните понравившиеся места — они появятся здесь." />
            ) : (
              <SpotCardGrid spots={liked} showAuthor />
            )}
          </TabsContent>
          <TabsContent value="saved">
            {bookmarked.length === 0 ? (
              <EmptyState message="Сохраняйте места, чтобы вернуться к ним позже." />
            ) : (
              <SpotCardGrid spots={bookmarked} showAuthor />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState({ message, children }: { message: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {children}
    </div>
  );
}
