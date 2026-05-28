// Управление акцентным цветом приложения (CSS-переменная --primary).
// Сохраняется в localStorage, применяется на :root, никакой БД.

export type AccentId =
  | "orange"
  | "red"
  | "purple"
  | "blue"
  | "teal"
  | "green";

export interface AccentPreset {
  id: AccentId;
  label: string;
  // HSL значения как строки «H S% L%», без `hsl()` — для CSS-переменных.
  hsl: string;
  // Для свотчей в UI — конкретный hex.
  swatch: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: "purple", label: "Фиолетовый",hsl: "270 75% 60%", swatch: "#a855f7" },
  { id: "orange", label: "Оранжевый", hsl: "14 95% 56%",  swatch: "#f56131" },
  { id: "red",    label: "Красный",   hsl: "0 85% 60%",   swatch: "#ef4444" },
  { id: "blue",   label: "Синий",     hsl: "215 90% 58%", swatch: "#3b82f6" },
  { id: "teal",   label: "Бирюзовый", hsl: "175 75% 45%", swatch: "#14b8a6" },
  { id: "green",  label: "Зелёный",   hsl: "145 65% 45%", swatch: "#22c55e" },
];

export const DEFAULT_ACCENT: AccentId = "purple";
const STORAGE_KEY = "hotspots:accent:v1";

export function getStoredAccent(): AccentId {
  if (typeof window === "undefined") return DEFAULT_ACCENT;
  const v = window.localStorage.getItem(STORAGE_KEY) as AccentId | null;
  if (v && ACCENT_PRESETS.some((p) => p.id === v)) return v;
  return DEFAULT_ACCENT;
}

export function setStoredAccent(id: AccentId): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
}

export function applyAccent(id: AccentId): void {
  if (typeof document === "undefined") return;
  const preset = ACCENT_PRESETS.find((p) => p.id === id) ?? ACCENT_PRESETS[0]!;
  const root = document.documentElement;
  root.style.setProperty("--primary", preset.hsl);
  root.style.setProperty("--ring", preset.hsl);
}

export function applyStoredAccent(): void {
  applyAccent(getStoredAccent());
}
