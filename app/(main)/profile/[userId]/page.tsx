import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Footprints, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { attachAuthor } from "@/lib/spot-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials, formatRelativeTime } from "@/lib/utils";
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

  const [spotsRes, visitsRes, likesRes] = await Promise.all([
    supabase
      .from("spots")
      .select("*, profiles!spots_user_id_fkey(id, username, avatar_url)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase.from("visits").select("*", { count: "exact", head: true }).eq("user_id", profile.id),
    supabase.from("likes").select("*", { count: "exact", head: true }).eq("user_id", profile.id),
  ]);

  const visitsCount = visitsRes.count ?? 0;
  const likesCount = likesRes.count ?? 0;
  const rawSpots = (spotsRes.data ?? []) as unknown as Array<
    Spot & { profiles: Pick<Profile, "id" | "username" | "avatar_url"> | null }
  >;
  const list = rawSpots.map((s) => attachAuthor(s));

  return (
    <div className="h-full scroll-area pb-safe-nav">
      <div className="mx-auto max-w-3xl px-4 md:px-8 pt-safe-content">
        <Link
          href="/"
          className="mb-4 inline-flex h-9 items-center gap-2 rounded-full border bg-card px-3 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Назад
        </Link>

        <div className="rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-orange-500/10 p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
              {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
              <AvatarFallback className="text-xl">{initials(profile.username)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-bold">{profile.username}</h1>
              {profile.bio && <p className="mt-1 text-sm text-foreground/80">{profile.bio}</p>}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <MiniStat icon={MapPin} value={list.length} label="Меток" />
            <MiniStat icon={Footprints} value={visitsCount ?? 0} label="Посещений" />
            <MiniStat icon={Heart} value={likesCount ?? 0} label="Лайков" />
          </div>
        </div>

        <h2 className="mt-6 text-lg font-semibold">Метки</h2>
        {list.length === 0 ? (
          <p className="mt-3 rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
            Этот пользователь ещё не создал ни одной метки.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {list.map((s) => (
              <Link
                key={s.id}
                href={`/spot/${s.id}`}
                className="group flex gap-3 rounded-2xl border bg-card p-3 transition-colors hover:bg-muted/40"
              >
                <div
                  className="h-16 w-16 shrink-0 rounded-xl bg-muted"
                  style={{ backgroundImage: `url('${s.photo_url}')`, backgroundSize: "cover", backgroundPosition: "center" }}
                />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-medium">{s.title}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{formatRelativeTime(s.created_at)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-background/60 backdrop-blur p-3">
      <div className="mb-1 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-xl font-bold leading-none">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
