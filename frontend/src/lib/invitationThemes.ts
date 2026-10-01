export const THEME_IDS = ["noir-calla", "chalk-and-vow", "nocturne-botanica"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME_ID: ThemeId = "noir-calla";

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  style: string;
  desc: string;
  previewBg: string;
  previewText: string;
  previewBorder: string;
  accentDot: string;
}

export const INVITATION_THEMES: ThemeMeta[] = [
  {
    id: "noir-calla",
    name: "Noir Calla",
    style: "Dark Minimalist & Luxury",
    desc: "Nuansa gelap elegan (noir) dengan aksen bunga calla lily putih dan tipografi emas halus.",
    previewBg: "bg-slate-950",
    previewText: "text-amber-100",
    previewBorder: "border-slate-800",
    accentDot: "bg-[#D4AF37]",
  },
  {
    id: "chalk-and-vow",
    name: "Chalk & Vow",
    style: "Light Fine-Art & Editorial",
    desc: "Kertas chalk hangat, tipografi serif klasik yang airy, bersih, dan romantis.",
    previewBg: "bg-[#FAF7F2]",
    previewText: "text-slate-900",
    previewBorder: "border-stone-300",
    accentDot: "bg-rose-500",
  },
  {
    id: "nocturne-botanica",
    name: "Nocturne Botanica",
    style: "Deep Emerald & Moody Floral",
    desc: "Keanggunan botani malam hari dengan hijau zamrud gelap dan keemasan hangat.",
    previewBg: "bg-[#0A1F18]",
    previewText: "text-emerald-100",
    previewBorder: "border-emerald-900",
    accentDot: "bg-emerald-400",
  },
];

export const resolveThemeId = (value?: string | null): ThemeId =>
  (THEME_IDS as readonly string[]).includes(value ?? "") ? (value as ThemeId) : DEFAULT_THEME_ID;
