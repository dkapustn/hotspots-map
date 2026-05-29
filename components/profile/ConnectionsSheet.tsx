"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/utils";

export type ConnectionType = "followers" | "following" | "friends";

interface PersonRow {
  id: string;
  username: string;
  avatar_url: string | null;
}

const TITLES: Record<ConnectionType, string> = {
  followers: "Подписчики",
  following: "Подписки",
  friends: "Друзья",
};

export function ConnectionsSheet({
  userId,
  type,
  onClose,
}: {
  userId: string;
  type: ConnectionType | null;
  onClose: () => void;
}) {
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!type) return;
    let cancelled = false;
    setLoading(true);
    setPeople([]);

    (async () => {
      const supabase = createClient();
      let rows: PersonRow[] = [];

      if (type === "followers") {
        const { data } = await supabase
          .from("follows")
          .select("p:profiles!follows_follower_id_fkey(id, username, avatar_url)")
          .eq("followee_id", userId);
        rows = (data ?? []).map((r: any) => r.p).filter(Boolean);
      } else if (type === "following") {
        const { data } = await supabase
          .from("follows")
          .select("p:profiles!follows_followee_id_fkey(id, username, avatar_url)")
          .eq("follower_id", userId);
        rows = (data ?? []).map((r: any) => r.p).filter(Boolean);
      } else {
        // Друзья: из view friendships берём вторую сторону пары.
        const { data } = await supabase
          .from("friendships")
          .select("user1_id, user2_id")
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
        const friendIds = (data ?? [])
          .map((f: any) => (f.user1_id === userId ? f.user2_id : f.user1_id))
          .filter(Boolean);
        if (friendIds.length > 0) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .in("id", friendIds);
          rows = (profs ?? []) as PersonRow[];
        }
      }

      if (!cancelled) {
        setPeople(rows);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [type, userId]);

  return (
    <Sheet open={!!type} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="md:max-w-lg md:mx-auto md:rounded-3xl md:mb-6">
        <SheetHeader>
          <SheetTitle>{type ? TITLES[type] : ""}</SheetTitle>
        </SheetHeader>

        <div className="px-5 pb-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] pt-2 md:pb-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : people.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <Users className="h-8 w-8 opacity-40" />
              <p className="text-sm">Здесь пока никого нет.</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {people.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/profile/${p.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-2xl p-2.5 transition active:bg-foreground/10 hover:bg-foreground/[0.06]"
                  >
                    <Avatar className="h-11 w-11">
                      {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.username} /> : null}
                      <AvatarFallback>{initials(p.username)}</AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1 truncate font-medium">{p.username}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
