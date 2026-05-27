"use client";
import { motion } from "framer-motion";
import {
  MapPin,
  Footprints,
  Heart,
  Sparkles,
  Trophy,
  Crown,
  Award,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  spotsCount: number;
  visitsCount: number;
  likesReceived: number;
  likesGiven: number;
}

interface Achievement {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
  color: string;
}

function buildAchievements(stats: Stats): Achievement[] {
  return [
    {
      id: "first-spot",
      label: "Первооткрыватель",
      desc: "Создал первую метку",
      icon: MapPin,
      unlocked: stats.spotsCount >= 1,
      color: "from-rose-400 to-rose-600",
    },
    {
      id: "first-visit",
      label: "Первый шаг",
      desc: "Подтвердил первый визит",
      icon: Footprints,
      unlocked: stats.visitsCount >= 1,
      color: "from-emerald-400 to-emerald-600",
    },
    {
      id: "collector",
      label: "Коллекционер",
      desc: "Создал 10 меток",
      icon: Sparkles,
      unlocked: stats.spotsCount >= 10,
      color: "from-amber-400 to-orange-500",
    },
    {
      id: "explorer",
      label: "Исследователь",
      desc: "Посетил 10 мест",
      icon: Trophy,
      unlocked: stats.visitsCount >= 10,
      color: "from-sky-400 to-blue-600",
    },
    {
      id: "popular",
      label: "Популярный",
      desc: "Набрал 50 лайков",
      icon: Heart,
      unlocked: stats.likesReceived >= 50,
      color: "from-pink-400 to-rose-600",
    },
    {
      id: "fan",
      label: "Активный фан",
      desc: "Поставил 50 лайков",
      icon: Star,
      unlocked: stats.likesGiven >= 50,
      color: "from-violet-400 to-purple-600",
    },
    {
      id: "legend",
      label: "Легенда",
      desc: "Создал 50 меток",
      icon: Crown,
      unlocked: stats.spotsCount >= 50,
      color: "from-yellow-400 to-amber-500",
    },
    {
      id: "master",
      label: "Мастер маршрутов",
      desc: "Посетил 50 мест",
      icon: Award,
      unlocked: stats.visitsCount >= 50,
      color: "from-indigo-400 to-blue-700",
    },
  ];
}

export function Achievements({ stats }: { stats: Stats }) {
  const items = buildAchievements(stats);
  const unlockedCount = items.filter((i) => i.unlocked).length;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-base font-semibold">Достижения</h3>
        <span className="text-xs text-muted-foreground">
          {unlockedCount} / {items.length}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {items.map((a, idx) => {
          const Icon = a.icon;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={cn(
                "group relative flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border p-2 text-center transition-transform hover:scale-[1.04]",
                a.unlocked ? "bg-card" : "bg-muted/30 opacity-50",
              )}
              title={a.unlocked ? `${a.label}: ${a.desc}` : `${a.desc} — ещё не получено`}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl text-white shadow",
                  a.unlocked
                    ? `bg-gradient-to-br ${a.color} shadow-primary/20`
                    : "bg-muted-foreground/30 shadow-none",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-[10px] font-medium leading-tight line-clamp-2">{a.label}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
