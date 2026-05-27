"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Plus, Trophy, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Карта", icon: Map, match: (p: string) => p === "/" },
  { href: "/top", label: "Топ", icon: Trophy, match: (p: string) => p.startsWith("/top") },
  {
    href: "/create",
    label: "Создать",
    icon: Plus,
    primary: true,
    match: (p: string) => p === "/create",
  },
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
      // h-14 ровный бар, без pb-safe, без -top-floating. + это просто
      // обычный таб с яркой плашкой — не «вылезает» наружу.
      className="relative shrink-0 z-[1000] border-t bg-background md:hidden"
    >
      <div className="mx-auto flex h-14 max-w-lg items-stretch">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.match(pathname);
          const isPrimary = "primary" in tab && tab.primary;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "group flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                isPrimary
                  ? "text-foreground"
                  : active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isPrimary ? (
                <span className="flex h-7 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-orange-500 text-white shadow-md shadow-primary/40 transition-transform group-active:scale-95">
                  <Icon className="h-5 w-5" strokeWidth={2.6} />
                </span>
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
