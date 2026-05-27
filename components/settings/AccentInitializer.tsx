"use client";
import { useEffect } from "react";
import { applyStoredAccent } from "@/lib/accent";

/**
 * Применяет сохранённый акцентный цвет на маунте.
 * Без рендера — просто side-effect, чтобы --primary применилась как можно
 * раньше после гидрации. (Применить до SSR нельзя — localStorage недоступен.)
 */
export function AccentInitializer() {
  useEffect(() => {
    applyStoredAccent();
  }, []);
  return null;
}
