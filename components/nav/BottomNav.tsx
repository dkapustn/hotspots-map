"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Plus, Trophy, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS_LEFT = [
  { href: "/", label: "Карта", icon: Map, match: (p: string) => p === "/" },
  { href: "/top", label: "Топ", icon: Trophy, match: (p: string) => p.startsWith("/top") },
] as const;

const TABS_RIGHT = [
  {
    href: "/profile",
    label: "Профиль",
    icon: User,
    match: (p: string) =>
      p === "/profile" || (p.startsWith("/profile/") && !p.startsWith("/profile/settings")),
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
      // НЕТ pb-safe. Бар имеет высоту ровно h-16 и стоит у самой нижней
      // границы экрана (через flex-col в layout + fixed inset-0).
      // iOS home-indicator pill будет рендериться поверх — это норма
      // для большинства iOS-приложений (Twitter X, Telegram и т.д.).
      className="relative shrink-0 z-[1000] border-t bg-background/95 backdrop-blur-xl md:hidden"
    >
      <div className="relative mx-auto flex h-16 max-w-lg items-stretch">
        {TABS_LEFT.map((t) => (
          <TabLink key={t.href} href={t.href} label={t.label} icon={t.icon} active={t.match(pathname)} />
        ))}

        <div className="w-16 shrink-0" aria-hidden="true" />

        {TABS_RIGHT.map((t) => (
          <TabLink key={t.href} href={t.href} label={t.label} icon={t.icon} active={t.match(pathname)} />
        ))}

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
