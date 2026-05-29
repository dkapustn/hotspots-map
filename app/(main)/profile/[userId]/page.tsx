import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { attachAuthor } from "@/lib/spot-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/user/FollowButton";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ShareProfileButton } from "@/components/profile/ShareProfileButton";
import { SpotCardGrid } from "@/components/profile/SpotCardGrid";
import { initials } from "@/lib/utils";
import type { Profile, Spot } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({ params }: { params: { userId: string } }) {
  const supabase = createClient();
  const profileRes = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.userId)
    .maybeSingle();

  const profile = profileRes.data as Profile | null;
  if (!profile) notFound();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  const isOwnProfile = currentUser?.id === profile.id;
  const isAnonymous = currentUser?.is_anonymous === true;

  const [
    spotsRes,
    visitsRes,
    likesRes,
    followersCountRes,
    followingCountRes,
    friendsRes,
    iFollowRes,
    theyFollowMeRes,
  ] = await Promise.all([
    supabase
      .from("spots")
      .select("*, profiles!spots_user_id_fkey(id, username, avatar_url)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase.from("visits").select("*", { count: "exact", head: true }).eq("user_id", profile.id),
    supabase.from("likes").select("*", { count: "exact", head: true }).eq("user_id", profile.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("followee_id", profile.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
    supabase.from("friendships").select("user1_id, user2_id"),
    currentUser && !isOwnProfile
      ? supabase
          .from("follows")
          .select("follower_id")
          .eq("follower_id", currentUser.id)
          .eq("followee_id", profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null } as { data: { follower_id: string } | null }),
    currentUser && !isOwnProfile
      ? supabase
          .from("follows")
          .select("follower_id")
          .eq("follower_id", profile.id)
          .eq("followee_id", currentUser.id)
          .maybeSingle()
      : Promise.resolve({ data: null } as { data: { follower_id: string } | null }),
  ]);

  const visitsCount = visitsRes.count ?? 0;
  const likesCount = likesRes.count ?? 0;
  const followersCount = followersCountRes.count ?? 0;
  const followingCount = followingCountRes.count ?? 0;
  const friendsCount = (friendsRes.data ?? []).filter(
    (f) => f.user1_id === profile.id || f.user2_id === profile.id,
  ).length;
  const iFollow = !!iFollowRes.data;
  const theyFollowMe = !!theyFollowMeRes.data;
  const friends = iFollow && theyFollowMe;

  const rawSpots = (spotsRes.data ?? []) as unknown as Array<
    Spot & { profiles: Pick<Profile, "id" | "username" | "avatar_url"> | null }
  >;
  const list = rawSpots.map((s) => attachAuthor(s));

  return (
    <div className="h-full scroll-area pb-safe-nav">
      <div className="mx-auto max-w-2xl px-4 md:px-8 pt-safe-content">
        <Link
          href="/"
          className="mb-4 inline-flex h-9 items-center gap-2 rounded-full border bg-card px-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" /> Назад
        </Link>

        {/* ── Centered header ── */}
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-b from-primary/10 to-card p-6">
          <ShareProfileButton
            userId={profile.id}
            username={profile.username}
            iconOnly
            className="absolute right-4 top-4 z-10 bg-background/60 backdrop-blur"
          />

          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
              {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
              <AvatarFallback className="text-2xl">{initials(profile.username)}</AvatarFallback>
            </Avatar>

            <h1 className="mt-4 text-2xl font-bold">{profile.username}</h1>
            {profile.bio ? (
              <p className="mt-1.5 max-w-sm text-sm text-foreground/80">{profile.bio}</p>
            ) : (
              <p className="mt-1.5 text-sm italic text-muted-foreground">Без описания</p>
            )}

            {!isOwnProfile && currentUser ? (
              <div className="mt-4 w-full max-w-xs">
                <FollowButton
                  userId={profile.id}
                  initialFollowing={iFollow}
                  initialFriends={friends}
                  isAnonymous={isAnonymous}
                  className="w-full"
                />
              </div>
            ) : null}
          </div>

          <div className="mt-6 border-t pt-5">
            <ProfileStats
              userId={profile.id}
              spots={list.length}
              visited={visitsCount}
              likes={likesCount}
              followers={followersCount}
              following={followingCount}
              friends={friendsCount}
            />
          </div>
        </div>

        {/* ── Spots ── */}
        <h2 className="mt-6 mb-3 text-lg font-semibold">Метки</h2>
        {list.length === 0 ? (
          <p className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
            Этот пользователь ещё не создал ни одной метки.
          </p>
        ) : (
          <SpotCardGrid spots={list} />
        )}
      </div>
    </div>
  );
}
