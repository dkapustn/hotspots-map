"use client";
import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { vibrate } from "@/lib/photo";

export function ShareButton({ spotId, title }: { spotId: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/spot/${spotId}`;
    const shareData = { title: `${title} — HotSpots Map`, text: "Зацени это место!", url };
    vibrate(6);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Ссылка скопирована");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("Не удалось поделиться");
      }
    }
  }

  return (
    <Button type="button" size="lg" variant="outline" onClick={handleShare} aria-label="Поделиться">
      {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Share2 className="h-5 w-5" />}
    </Button>
  );
}
