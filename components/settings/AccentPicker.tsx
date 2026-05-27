"use client";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import {
  ACCENT_PRESETS,
  applyAccent,
  getStoredAccent,
  setStoredAccent,
  type AccentId,
} from "@/lib/accent";
import { cn } from "@/lib/utils";

export function AccentPicker() {
  const [active, setActive] = useState<AccentId>("orange");

  useEffect(() => {
    setActive(getStoredAccent());
  }, []);

  function handlePick(id: AccentId) {
    setActive(id);
    setStoredAccent(id);
    applyAccent(id);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Акцентный цвет</span>
        <span className="text-xs text-muted-foreground">
          {ACCENT_PRESETS.find((p) => p.id === active)?.label}
        </span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {ACCENT_PRESETS.map((preset) => {
          const isActive = preset.id === active;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePick(preset.id)}
              aria-label={preset.label}
              aria-pressed={isActive}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95",
                isActive ? "scale-110" : "hover:scale-105",
              )}
              style={{
                backgroundColor: preset.swatch,
                boxShadow: isActive
                  ? `0 0 0 3px hsl(var(--background)), 0 0 0 5px ${preset.swatch}`
                  : `0 4px 12px ${preset.swatch}40`,
              }}
            >
              {isActive && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Check className="h-5 w-5 text-white" strokeWidth={3} />
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
