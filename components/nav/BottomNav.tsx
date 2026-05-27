"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Plus, Trophy, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

// Раскладка: 2 таба | spacer (под floating +) | 2 таба
// Spacer ровно по центру → floating «+» центрирован геометрически.
const TABS_LEFT = [
  { href: "/", label: "Карта", icon: Map, match: (p: string) => p === "/" },
  { href: "/top", label: "Топ", icon: Trophy, match: (p: string) => p.startsWith("/top") },
] as const;

const TABS_RIGHT = [
  {
    href: "/profile",
    label: "Профиль",
    icon: User,
    match: (p: string) => p === "/profile" || (p.startsWith("/profile/") && !p.startsWith("/profile/settings")),
  },
  {
    href: "/profile/settings",
    label: "Настройки",
    icon: Settings,
    match: (p: string) => p.startsWith("/profile/settings"),
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Главная навигация"
      // pb: уважаем safe-area, но КАПИРУЕМ на 0.75rem — иначе на PWA
      // у iPhone (env≈34px) внизу видна толстая пустая полоса. Минимум
      // 0.25rem чтобы тапы не сидели впритык к нижней грани.
      className="fixed inset-x-0 bottom-0 z-[1000] border-t bg-background/95 backdrop-blur-xl md:hidden pb-[max(min(env(safe-area-inset-bottom,0px),0.75rem),0.25rem)]"
    >
      <div className="relative mx-auto flex h-16 max-w-lg items-stretch">
        {TABS_LEFT.map((t) => (
          <TabLink key={t.href} href={t.href} label={t.label} icon={t.icon} active={t.match(pathname)} />
        ))}

        {/* Spacer строго по центру нав-бара под floating «+». */}
        <div className="w-16 shrink-0" aria-hidden="true" />

        {TABS_RIGHT.map((t) => (
          <TabLink key={t.href} href={t.href} label={t.label} icon={t.icon} active={t.match(pathname)} />
        ))}

        {/* Floating «+» — абсолютно позиционированный, в центре nav-бара. */}
        <Link
          href="/create"
          aria-label="Создать метку"
          className={cn(
            "absolute left-1/2 -translate-x-1/2 -top-6",
            "flex h-14 w-14 items-center justify-center rounded-full",
            "bg-gradient-to-br from-primary to-orange-500 text-white",
            "shadow-lg shadow-primary/40 ring-4 ring-background",
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
        "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}
