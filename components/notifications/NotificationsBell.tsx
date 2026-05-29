"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Heart, MessageCircle, Footprints, UserPlus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { initials, formatRelativeTime } from "@/lib/utils";

type NotifType = "like" | "comment" | "visit" | "follow";

interface NotifRow {
  id: string;
  type: NotifType;
  read: boolean;
  created_at: string;
  spot_id: string | null;
  actor: { id: string; username: string; avatar_url: string | null } | null;
  spot: { id: string; title: string } | null;
}

const SELECT =
  "id, type, read, created_at, spot_id, " +
  "actor:profiles!notifications_actor_id_fkey(id, username, avatar_url), " +
  "spot:spots!notifications_spot_id_fkey(id, title)";

export function NotificationsBell({ userId }: { userId: string }) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotifRow[]>([]);
  const [loading, setLoading] = useState(false);
  // Уникальное имя канала на каждый экземпляр: на карте колокольчик
  // рендерится дважды (мобильный + десктопный), и одинаковое имя канала
  // вызывало ошибку "cannot add postgres_changes callbacks after subscribe()".
  const [channelId] = useState(() => Math.random().toString(36).slice(2));

  // Начальный счётчик непрочитанных + realtime-подписка.
  useEffect(() => {
    const supabase = createClient();
    let active = true;

    (async () => {
      const { count: c } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("read", false);
      if (active) setCount(c ?? 0);
    })();

    const channel = supabase
      .channel(`notifications:${userId}:${channelId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => setCount((n) => n + 1),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [userId, channelId]);

  const handleOpen = useCallback(async () => {
    setOpen(true);
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select(SELECT)
      .order("created_at", { ascending: false })
      .limit(50);
    setItems((data ?? []) as unknown as NotifRow[]);
    setLoading(false);
    // Помечаем все прочитанными.
    if (count > 0) {
      setCount(0);
      await supabase.from("notifications").update({ read: true }).eq("read", false);
    }
  }, [count]);

  return (
    <>
      <button
        onClick={handleOpen}
        className="glass-strong glass-shine relative flex h-10 w-10 items-center justify-center rounded-full"
        aria-label="Уведомления"
      >
        <Bell className="h-4 w-4" />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background"
            >
              {count > 99 ? "99+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="md:max-w-lg md:mx-auto md:rounded-3xl md:mb-6">
          <SheetHeader>
            <SheetTitle>Уведомления</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] pt-2 md:pb-6">
            {loading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                <Bell className="animate-float h-8 w-8 opacity-40" />
                <p className="text-sm">Пока нет уведомлений.</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {items.map((n) => (
                  <NotificationItem key={n.id} n={n} onNavigate={() => setOpen(false)} />
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

const TYPE_META: Record<
  NotifType,
  { icon: React.ComponentType<{ className?: string }>; tint: string; verb: string }
> = {
  like: { icon: Heart, tint: "bg-rose-500", verb: "оценил(а) вашу метку" },
  comment: { icon: MessageCircle, tint: "bg-sky-500", verb: "прокомментировал(а)" },
  visit: { icon: Footprints, tint: "bg-emerald-500", verb: "посетил(а) вашу метку" },
  follow: { icon: UserPlus, tint: "bg-primary", verb: "подписался(ась) на вас" },
};

function NotificationItem({ n, onNavigate }: { n: NotifRow; onNavigate: () => void }) {
  const meta = TYPE_META[n.type];
  const Icon = meta.icon;
  const href = n.type === "follow" ? `/profile/${n.actor?.id ?? ""}` : `/spot/${n.spot_id ?? ""}`;
  const name = n.actor?.username ?? "Кто-то";
  const spotTitle = n.spot?.title;

  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className={`flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-foreground/[0.06] active:bg-foreground/10 ${
          n.read ? "" : "bg-primary/5"
        }`}
      >
        <div className="relative shrink-0">
          <Avatar className="h-11 w-11">
            {n.actor?.avatar_url ? <AvatarImage src={n.actor.avatar_url} alt={name} /> : null}
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
          <span
            className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white ring-2 ring-background ${meta.tint}`}
          >
            <Icon className="h-3 w-3" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug">
            <span className="font-semibold">{name}</span> {meta.verb}
            {spotTitle && n.type !== "follow" ? (
              <span className="text-muted-foreground"> «{spotTitle}»</span>
            ) : null}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{formatRelativeTime(n.created_at)}</p>
        </div>
        {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
      </Link>
    </li>
  );
}
