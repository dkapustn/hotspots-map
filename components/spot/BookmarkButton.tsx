"use client";
import { useState } from "react";
import { Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { vibrate } from "@/lib/photo";
import { cn } from "@/lib/utils";

export function BookmarkButton({
  spotId,
  bookmarked,
  onChange,
}: {
  spotId: string;
  bookmarked: boolean;
  onChange: (v: boolean) => void;
}) {
  const [pending, setPending] = useState(false);

  async function handle() {
    if (pending) return;
    setPending(true);
    const next = !bookmarked;
    onChange(next);
    vibrate(6);
    const res = await fetch(`/api/spots/${spotId}/bookmark`, {
      method: next ? "POST" : "DELETE",
    });
    setPending(false);
    if (!res.ok) {
      onChange(!next);
      toast.error("Не удалось");
      return;
    }
    toast.success(next ? "Сохранено в закладки" : "Удалено из закладок");
  }

  return (
    <Button
      type="button"
      size="lg"
      variant="outline"
      onClick={handle}
      disabled={pending}
      aria-pressed={bookmarked}
      className={cn(
        bookmarked &&
          "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300",
      )}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={bookmarked ? "on" : "off"}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="inline-flex"
        >
          <Bookmark
            className={cn("h-5 w-5", bookmarked && "fill-amber-500 text-amber-500")}
          />
        </motion.span>
      </AnimatePresence>
      <span className="sr-only">{bookmarked ? "Убрать из закладок" : "Сохранить"}</span>
    </Button>
  );
}
