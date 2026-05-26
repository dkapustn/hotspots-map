"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Plus, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Карта", icon: Map },
  { href: "/top", label: "Топ", icon: Trophy },
  { href: "/create", label: "", icon: Plus, primary: true },
  { href: "/profile", label: "Профиль", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-stretch justify-around pb-safe">
        {ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          if ("primary" in item && item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label="Создать"
                className="-mt-7 flex h-14 w-14 items-center justify-center self-center rounded-full bg-gradient-to-br from-primary to-orange-500 text-white shadow-xl shadow-primary/30 transition-transform active:scale-95"
              >
                <Icon className="h-6 w-6" strokeWidth={2.5} />
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
