"use client";
import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { vibrate } from "@/lib/photo";
import { cn } from "@/lib/utils";

export function ShareProfileButton({
  userId,
  username,
  className,
}: {
  userId: string;
  username: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/profile/${userId}`;
    const shareData = { title: `${username} — HotSpots Map`, text: `Профиль ${username}`, url };
    vibrate(6);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Ссылка на профиль скопирована");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("Не удалось поделиться");
      }
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleShare}
      className={cn("gap-2", className)}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
      Поделиться
    </Button>
  );
}
