"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Plus, Trophy, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Карта", icon: Map, match: (p: string) => p === "/" },
  { href: "/top", label: "Топ", icon: Trophy, match: (p: string) => p.startsWith("/top") },
  { href: "/create", label: "Создать", icon: Plus, match: (p: string) => p === "/create" },
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
      className="fixed inset-x-0 bottom-0 z-[1000] border-t border-border bg-background md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-14 items-stretch">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px]",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
