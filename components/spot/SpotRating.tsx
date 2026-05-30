"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { vibrate } from "@/lib/photo";
import { notifyGuest } from "@/lib/guest";

interface Props {
  spotId: string;
  initialUserValue: number | null;
  initialAverage: number;
  initialCount: number;
  isGuest?: boolean;
}

export function SpotRating({ spotId, initialUserValue, initialAverage, initialCount, isGuest }: Props) {
  const [userValue, setUserValue] = useState<number | null>(initialUserValue);
  const [average, setAverage] = useState<number>(initialAverage);
  const [count, setCount] = useState<number>(initialCount);
  const [hover, setHover] = useState<number | null>(null);
  const [pending, setPending] = useState(false);

  async function handleRate(value: number) {
    if (isGuest) {
      notifyGuest();
      return;
    }
    if (pending) return;
    setPending(true);
    vibrate(8);

    // Optimistic
    const prevValue = userValue;
    setUserValue(value);

    const res = await fetch(`/api/spots/${spotId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    setPending(false);

    if (!res.ok) {
      setUserValue(prevValue);
      toast.error("Не удалось сохранить оценку");
      return;
    }
    const json = await res.json();
    setAverage(Number(json.avg_rating ?? 0));
    setCount(json.ratings_count ?? 0);
  }

  async function handleClear() {
    if (pending || userValue === null) return;
    setPending(true);
    const res = await fetch(`/api/spots/${spotId}/rating`, { method: "DELETE" });
    setPending(false);
    if (!res.ok) {
      toast.error("Не удалось убрать оценку");
      return;
    }
    setUserValue(null);
    const json = await res.json();
    setAverage(Number(json.avg_rating ?? 0));
    setCount(json.ratings_count ?? 0);
  }

  const displayValue = hover ?? userValue ?? 0;

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-sm font-semibold">Оценка</div>
          <div className="text-xs text-muted-foreground">
            {count > 0
              ? `${Number(average).toFixed(1)} из 5 · ${count} ${count === 1 ? "оценка" : "оценок"}`
              : "Пока никто не оценил"}
          </div>
        </div>
        {userValue !== null && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Убрать оценку
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1.5" onMouseLeave={() => setHover(null)}>
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= displayValue;
          return (
            <button
              key={star}
              type="button"
              disabled={pending}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHover(star)}
              aria-label={`${star} звёзд`}
              className="p-1 transition-transform active:scale-90 disabled:opacity-50"
            >
              <motion.span
                animate={{ scale: active ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="inline-block"
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    active
                      ? "fill-amber-400 text-amber-400"
                      : "fill-transparent text-muted-foreground/40",
                  )}
                  strokeWidth={1.8}
                />
              </motion.span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
