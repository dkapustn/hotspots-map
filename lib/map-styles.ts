// Стили карты (CARTO basemaps). Выбор пользователя — в localStorage.

export type MapStyleId = "voyager" | "positron" | "darkmatter";

export interface MapStyle {
  id: MapStyleId;
  label: string;
  description: string;
  url: string;
  // Цвета миниатюры в пикере (фон, штрих, контраст).
  preview: { bg: string; line: string; accent: string };
}

export const MAP_STYLES: MapStyle[] = [
  {
    id: "voyager",
    label: "Voyager",
    description: "Цветная, универсальная",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    preview: { bg: "#f5f0e6", line: "#cbd5e1", accent: "#f97316" },
  },
  {
    id: "positron",
    label: "Светлая",
    description: "Минималистичная, читаемая",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    preview: { bg: "#ffffff", line: "#e2e8f0", accent: "#94a3b8" },
  },
  {
    id: "darkmatter",
    label: "Тёмная",
    description: "Тёмная, для ночи",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    preview: { bg: "#0f172a", line: "#1e293b", accent: "#475569" },
  },
];

export const DEFAULT_MAP_STYLE: MapStyleId = "voyager";
const STORAGE_KEY = "hotspots:map-style:v1";
const CHANGE_EVENT = "hotspots:map-style-change";

export function getStoredMapStyle(): MapStyleId {
  if (typeof window === "undefined") return DEFAULT_MAP_STYLE;
  const v = window.localStorage.getItem(STORAGE_KEY) as MapStyleId | null;
  if (v && MAP_STYLES.some((s) => s.id === v)) return v;
  return DEFAULT_MAP_STYLE;
}

export function setStoredMapStyle(id: MapStyleId): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
  // Свой custom-event — `storage` event срабатывает только в ДРУГИХ вкладках,
  // а нам нужно обновить карту в той же вкладке.
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: id }));
}

export function getMapStyle(id: MapStyleId): MapStyle {
  return MAP_STYLES.find((s) => s.id === id) ?? MAP_STYLES[0]!;
}

export const MAP_STYLE_CHANGE_EVENT = CHANGE_EVENT;
