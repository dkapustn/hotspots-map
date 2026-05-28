"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Plus, Trophy, User, Settings } from "lucide-react";
import { motion } from "framer-motion";
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
  const activeIdx = TABS.findIndex((t) => t.match(pathname));

  return (
    <nav
      aria-label="Главная навигация"
      // Gradient bg: top — semi-transparent glass (карта проступает),
      // bottom — точно цвет html bg. На границе бара и зоны под ним
      // нет визуального шва: и в баре, и ниже один и тот же цвет.
      // backdrop-filter создаёт frosted-blur только там, где bg
      // полупрозрачный (т.е. сверху). Снизу blur не работает (bg
      // непрозрачный) — и это правильно: нижняя часть = solid фон.
      className="fixed inset-x-0 bottom-0 z-[1000] rounded-t-[28px] border-t border-white/5 md:hidden"
      style={{
        background:
          "linear-gradient(to bottom, rgb(var(--glass-tint) / 0.55) 0%, rgb(var(--glass-tint) / 0.85) 45%, hsl(var(--background)) 100%)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-md items-stretch px-2">
        {TABS.map((tab, idx) => {
          const Icon = tab.icon;
          const active = idx === activeIdx;
          const isPrimary = "primary" in tab && tab.primary;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              className={cn(
                "group relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                isPrimary
                  ? "text-foreground"
                  : active
                    ? "text-primary"
                    : "text-muted-foreground",
              )}
            >
              {active && !isPrimary && (
                <motion.span
                  layoutId="liquid-nav-pill"
                  className="absolute inset-x-1 inset-y-1.5 -z-0 rounded-2xl bg-foreground/8 dark:bg-white/8"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}

              {isPrimary ? (
                <span className="relative flex h-9 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-500 text-white shadow-lg shadow-primary/40 transition-transform group-active:scale-95">
                  <Icon className="h-5 w-5" strokeWidth={2.6} />
                </span>
              ) : (
                <Icon
                  className="relative z-10 h-5 w-5"
                  strokeWidth={active ? 2.5 : 2}
                />
              )}
              {!isPrimary && <span className="relative z-10">{tab.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
