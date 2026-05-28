import { redirect } from "next/navigation";
import Link from "next/link";
import { Settings, Plus, MapPin, Footprints, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { attachAuthor } from "@/lib/spot-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initials, formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: spots }, { data: visits }, { data: likes }] = await Promise.all([
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
  ]);

  const mySpots = (spots ?? []).map((s) => attachAuthor(s as any));
  const visited = (visits ?? [])
    .map((v: any) => (v.spots ? attachAuthor(v.spots) : null))
    .filter(Boolean) as ReturnType<typeof attachAuthor>[];
  const liked = (likes ?? [])
    .map((l: any) => (l.spots ? attachAuthor(l.spots) : null))
    .filter(Boolean) as ReturnType<typeof attachAuthor>[];

  // Считаем общее число лайков, полученных пользователем (на всех его метках).
  let likesReceived = 0;
  if (mySpots.length > 0) {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .in("spot_id", mySpots.map((s) => s.id));
    likesReceived = count ?? 0;
  }

  return (
    <div className="h-full scroll-area pb-safe-nav">
      <div className="mx-auto max-w-3xl px-4 md:px-8 pt-safe-content">
        {/* Header card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-background to-orange-500/10 border p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
              {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
              <AvatarFallback className="text-xl">{initials(profile?.username)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-bold">{profile?.username ?? "—"}</h1>
              {profile?.bio ? (
                <p className="mt-1 text-sm text-foreground/80 line-clamp-2">{profile.bio}</p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground italic">Без описания</p>
              )}
            </div>
            <Button asChild size="icon" variant="secondary" className="shrink-0">
              <Link href="/profile/settings" aria-label="Настройки">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <Stat icon={MapPin} value={mySpots.length} label="Меток" />
            <Stat icon={Footprints} value={visited.length} label="Посещено" />
            <Stat icon={Heart} value={likesReceived} label="Получено лайков" />
          </div>
        </div>

        <Tabs defaultValue="mine" className="mt-6">
          <TabsList>
            <TabsTrigger value="mine">Мои метки</TabsTrigger>
            <TabsTrigger value="visited">Посещённые</TabsTrigger>
            <TabsTrigger value="liked">Лайкнутые</TabsTrigger>
          </TabsList>

          <TabsContent value="mine">
            {mySpots.length === 0 ? (
              <EmptyState message="Вы ещё не создали ни одной метки.">
                <Button asChild className="mt-3"><Link href="/create"><Plus className="h-4 w-4" /> Создать</Link></Button>
              </EmptyState>
            ) : (
              <SpotsList spots={mySpots} />
            )}
          </TabsContent>
          <TabsContent value="visited">
            {visited.length === 0 ? (
              <EmptyState message="Вы ещё никого не посещали. Откройте карту!" />
            ) : (
              <SpotsList spots={visited} />
            )}
          </TabsContent>
          <TabsContent value="liked">
            {liked.length === 0 ? (
              <EmptyState message="Лайкните понравившиеся места — они появятся здесь." />
            ) : (
              <SpotsList spots={liked} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: number; label: string }) {
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

function EmptyState({ message, children }: { message: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {children}
    </div>
  );
}

function SpotsList({ spots }: { spots: { id: string; title: string; photo_url: string; created_at: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {spots.map((s) => (
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
  );
}
