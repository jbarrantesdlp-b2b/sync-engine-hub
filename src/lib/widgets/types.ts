export const MODES = ["analog", "digital", "status", "split"] as const;
export const ACCENTS = ["cyan", "amber"] as const;
export const FONTS = ["suite", "reloj", "tecnica"] as const;
export const SIZES = ["s", "m", "l"] as const;
export const EFFECTS = ["glow", "ring", "plain"] as const;
export const SLOTS = ["none", "battery", "link", "steps"] as const;

export type WidgetMode = (typeof MODES)[number];
export type Accent = (typeof ACCENTS)[number];
export type FontId = (typeof FONTS)[number];
export type SizeId = (typeof SIZES)[number];
export type EffectId = (typeof EFFECTS)[number];
export type SlotId = (typeof SLOTS)[number];

export type WidgetConfig = {
  mode: WidgetMode;
  accent: Accent;
  font: FontId;
  size: SizeId;
  effect: EffectId;
  slot: SlotId;
};

export type SavedWidget = WidgetConfig & {
  id: string;
  name: string;
};

export const MODE_LABEL: Record<WidgetMode, string> = {
  analog: "Analógico preciso",
  digital: "Digital 1",
  status: "Digital 2",
  split: "Digital 3",
};

export const FONT_LABEL: Record<FontId, string> = {
  suite: "Suite",
  reloj: "Reloj",
  tecnica: "Técnica",
};

export const SIZE_LABEL: Record<SizeId, string> = {
  s: "2×2",
  m: "3×3",
  l: "4×2",
};

export const EFFECT_LABEL: Record<EffectId, string> = {
  glow: "Halo fijo",
  ring: "Energía",
  plain: "Sin efecto",
};

export const SLOT_LABEL: Record<SlotId, string> = {
  none: "Ninguna",
  battery: "Batería",
  link: "Enlace",
  steps: "Pasos",
};

export const PRESETS: Array<WidgetConfig & { name: string }> = [
  { name: "Analógico", mode: "analog", accent: "cyan", font: "suite", size: "m", effect: "glow", slot: "none" },
  { name: "Digital 1", mode: "digital", accent: "cyan", font: "reloj", size: "m", effect: "glow", slot: "none" },
  { name: "Digital 2", mode: "status", accent: "cyan", font: "suite", size: "m", effect: "glow", slot: "steps" },
  { name: "Digital 3", mode: "split", accent: "cyan", font: "reloj", size: "m", effect: "glow", slot: "none" },
];

export function isMode(v: string): v is WidgetMode {
  return (MODES as readonly string[]).includes(v);
}
export function isAccent(v: string): v is Accent {
  return (ACCENTS as readonly string[]).includes(v);
}
export function isFont(v: string): v is FontId {
  return (FONTS as readonly string[]).includes(v);
}
export function isSize(v: string): v is SizeId {
  return (SIZES as readonly string[]).includes(v);
}
export function isEffect(v: string): v is EffectId {
  return (EFFECTS as readonly string[]).includes(v);
}
export function isSlot(v: string): v is SlotId {
  return (SLOTS as readonly string[]).includes(v);
}
