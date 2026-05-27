"use client";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import {
  MAP_STYLES,
  getStoredMapStyle,
  setStoredMapStyle,
  type MapStyleId,
} from "@/lib/map-styles";
import { cn } from "@/lib/utils";

export function MapStylePicker() {
  const [active, setActive] = useState<MapStyleId>("voyager");

  useEffect(() => {
    setActive(getStoredMapStyle());
  }, []);

  function handlePick(id: MapStyleId) {
    setActive(id);
    setStoredMapStyle(id);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Оформление карты</span>
        <span className="text-xs text-muted-foreground">
          {MAP_STYLES.find((s) => s.id === active)?.label}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {MAP_STYLES.map((style) => {
          const isActive = style.id === active;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => handlePick(style.id)}
              aria-pressed={isActive}
              className={cn(
                "group relative flex flex-col items-stretch overflow-hidden rounded-xl border text-left transition-all active:scale-95",
                isActive
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-border hover:border-foreground/30",
              )}
            >
              {/* Превью миниатюра */}
              <div
                className="relative aspect-[4/3] w-full"
                style={{ backgroundColor: style.preview.bg }}
              >
                <svg viewBox="0 0 100 75" className="h-full w-full">
                  <path
                    d="M0 30 L100 25 M10 0 L15 75 M50 0 L60 75 M0 55 L100 60"
                    stroke={style.preview.line}
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle cx="50" cy="40" r="4" fill={style.preview.accent} />
                </svg>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow"
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </motion.div>
                )}
              </div>
              <div className="bg-card/60 px-2 py-1.5 text-center">
                <div className="text-xs font-medium leading-tight">{style.label}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
