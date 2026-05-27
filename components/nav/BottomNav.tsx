"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Plus, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Карта", icon: Map, match: (p: string) => p === "/" },
  { href: "/top", label: "Топ", icon: Trophy, match: (p: string) => p.startsWith("/top") },
  { href: "/profile", label: "Профиль", icon: User, match: (p: string) => p.startsWith("/profile") },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Главная навигация"
      className="fixed inset-x-0 bottom-0 z-[1000] border-t bg-background/95 backdrop-blur-xl md:hidden pb-safe"
    >
      <div className="relative mx-auto flex h-16 max-w-md items-stretch">
        {/* Левая половина */}
        <TabLink {...TABS[0]} active={TABS[0].match(pathname)} />
        <TabLink {...TABS[1]} active={TABS[1].match(pathname)} />

        {/* Spacer для floating-кнопки */}
        <div className="w-16 shrink-0" aria-hidden="true" />

        {/* Правая половина */}
        <TabLink {...TABS[2]} active={TABS[2].match(pathname)} />

        {/* Floating «+» — абсолютная позиция, чтобы не ломать flex и
            не быть обрезанной overflow родителя. */}
        <Link
          href="/create"
          aria-label="Создать метку"
          className={cn(
            "absolute left-1/2 -translate-x-1/2 -top-6",
            "flex h-14 w-14 items-center justify-center rounded-full",
            "bg-gradient-to-br from-primary to-orange-500 text-white",
            "shadow-xl shadow-primary/30 ring-4 ring-background",
            "transition-transform active:scale-95",
          )}
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </Link>
      </div>
    </nav>
  );
}

function TabLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}
