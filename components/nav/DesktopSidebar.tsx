"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Plus, Trophy, User, Settings, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

const ITEMS = [
  { href: "/", label: "Карта", icon: Map },
  { href: "/top", label: "Топ мест", icon: Trophy },
  { href: "/create", label: "Создать метку", icon: Plus },
  { href: "/profile", label: "Профиль", icon: User },
  { href: "/profile/settings", label: "Настройки", icon: Settings },
] as const;

export function DesktopSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-card/40 backdrop-blur-xl z-[1000]">
      <div className="flex items-center gap-3 border-b px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 shadow-lg shadow-primary/20">
          <MapPin className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-base font-bold leading-tight">{APP_NAME}</div>
          <div className="text-[11px] text-muted-foreground">Делись крутыми местами</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/" && href !== "/profile" && pathname.startsWith(href)) ||
            (href === "/profile" && pathname === "/profile");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}
      </div>
    </aside>
  );
}
