"use client";
import { useState } from "react";
import { Footprints, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getCurrentPosition, formatDistance } from "@/lib/geo";
import { vibrate } from "@/lib/photo";
import { notifyGuest } from "@/lib/guest";
import { cn } from "@/lib/utils";

interface Props {
  spotId: string;
  visited: boolean;
  onVisited: () => void;
  className?: string;
  isGuest?: boolean;
}

export function VisitButton({ spotId, visited, onVisited, className, isGuest }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleVisit() {
    if (isGuest) {
      notifyGuest();
      return;
    }
    if (visited) {
      toast.info("Вы уже посетили это место!");
      return;
    }
    setLoading(true);
    try {
      const pos = await getCurrentPosition();
      const res = await fetch(`/api/spots/${spotId}/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: pos.lat, longitude: pos.lng, accuracy: pos.accuracy }),
      });
      const json = await res.json();
      if (res.status === 422 && json?.error === "too_far") {
        const distance = formatDistance(json.distance_m ?? 0);
        const required = formatDistance(json.required_m ?? 100);
        toast.warning("Подойдите ближе", {
          description: `Вы в ${distance} от метки, нужно быть в пределах ${required}.`,
        });
        return;
      }
      if (!res.ok) {
        toast.error(json?.error ?? "Не удалось засчитать визит");
        return;
      }
      vibrate([10, 30, 10, 30, 30]);
      const distance = formatDistance(json.distance_m ?? 0);
      toast.success("Визит подтверждён!", { description: `Вы в ${distance} от метки.` });
      onVisited();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка геолокации");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      size="lg"
      onClick={handleVisit}
      disabled={loading}
      variant={visited ? "outline" : "default"}
      className={cn(
        visited &&
          "border-emerald-400/60 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300",
        className,
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : visited ? <Check className="h-4 w-4" /> : <Footprints className="h-4 w-4" />}
      {visited ? "Посещено" : "Посетить"}
    </Button>
  );
}
