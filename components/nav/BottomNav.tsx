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
      // Liquid Glass — full-width bar в самом низу. Закруглён только
      // сверху (выглядит как drawer, поднятый со дна). Нет пустоты
      // снизу/сбоку. Карта сразу под верхним краем бара.
      // pb внутри плашки = safe-area для home-indicator iOS, но
      // КАПИРОВАНО до 0.75rem — иначе на PWA полоса 34px слишком толста.
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[1000] md:hidden"
    >
      <div className="pointer-events-auto">
        <div className="glass-strong glass-shine rounded-t-[28px] px-2 pt-2 pb-[max(min(env(safe-area-inset-bottom,0px),0.75rem),0.375rem)]">
          <div className="relative mx-auto flex max-w-md items-stretch">
            {TABS.map((tab, idx) => {
              const Icon = tab.icon;
              const active = idx === activeIdx;
              const isPrimary = "primary" in tab && tab.primary;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-label={tab.label}
                  className="relative flex flex-1 items-center justify-center py-2.5"
                >
                  {/* Активная «пилюля» с shared-layout анимацией */}
                  {active && !isPrimary && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-[20px] bg-foreground/10 dark:bg-white/10"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}

                  {isPrimary ? (
                    <span className="relative flex h-9 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-500 text-white shadow-lg shadow-primary/35 transition-transform active:scale-95">
                      <Icon className="h-5 w-5" strokeWidth={2.6} />
                    </span>
                  ) : (
                    <Icon
                      className={cn(
                        "relative z-10 h-[22px] w-[22px] transition-colors",
                        active ? "text-foreground" : "text-muted-foreground",
                      )}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
