"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { vibrate } from "@/lib/photo";
import { cn } from "@/lib/utils";

export function LikeButton({
  spotId,
  liked,
  onChange,
  className,
}: {
  spotId: string;
  liked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  const [pending, setPending] = useState(false);

  async function handle() {
    setPending(true);
    const next = !liked;
    onChange(next); // optimistic
    vibrate(8);
    const res = await fetch(`/api/spots/${spotId}/like`, { method: next ? "POST" : "DELETE" });
    setPending(false);
    if (!res.ok) {
      onChange(!next); // rollback
      toast.error("Не удалось поставить лайк");
    }
  }

  return (
    <Button
      type="button"
      size="lg"
      variant="outline"
      onClick={handle}
      disabled={pending}
      aria-pressed={liked}
      className={cn(
        liked &&
          "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={liked ? "on" : "off"}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="inline-flex"
        >
          <Heart className={cn("h-5 w-5", liked && "fill-rose-500 text-rose-500")} />
        </motion.span>
      </AnimatePresence>
      <span className="sr-only">{liked ? "Убрать лайк" : "Лайкнуть"}</span>
    </Button>
  );
}
