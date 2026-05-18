import type { HaloPalette } from "./PackHalo";

export type PackVariant = "paid" | "free";

export type PackInventoryItem = {
  emoji: string;
  text: string;
};

export type Pack = {
  variant: PackVariant;
  catalogHeader: string;
  name: string;
  tagline: string;
  price: string;
  priceStrap?: string;
  inventory: PackInventoryItem[];
  ctaLabel: string;
  ctaHref: string;
};

export const PAID_PACK: Pack = {
  variant: "paid",
  catalogHeader: "MATERIALS¹ · EDITION 01 · 160 SPECIMENS",
  name: "Materials¹",
  tagline: "The full library. 160 specimens.",
  price: "$9",
  priceStrap: "paid once.",
  inventory: [
    { emoji: "🌄", text: "160 stills" },
    { emoji: "🎥", text: "160 video loops" },
    { emoji: "👻", text: "160 transparent PNGs" },
    { emoji: "✨", text: "5× 4K hero loops" },
    { emoji: "🦸‍♂️", text: "3× hero designs for web" },
    { emoji: "✏️", text: "9× UI card templates" },
    { emoji: "🎓", text: "Mini guide: Materials in AI" },
    { emoji: "🛠️", text: "3 prompts for making your own" },
    { emoji: "📁", text: "Figma file" },
    { emoji: "⚡️", text: "Lifetime updates" },
    { emoji: "🙋‍♂️", text: "Support" },
  ],
  ctaLabel: "Get Materials¹ — $9",
  ctaHref: "#buy",
};

export const FREE_PACK: Pack = {
  variant: "free",
  catalogHeader: "DARK MATERIALS · SERIES Dk · 10 SPECIMENS",
  name: "Dark Materials",
  tagline: "Ten dark Materials. Free, no email.",
  price: "Free",
  inventory: [
    { emoji: "🌄", text: "10 stills" },
    { emoji: "🎥", text: "10 video loops" },
    { emoji: "👻", text: "10 transparent PNGs" },
    { emoji: "⚡️", text: "Free updates" },
  ],
  ctaLabel: "Get Dark Materials",
  ctaHref: "https://dannystuart.gumroad.com/l/Dark-Materials-Abstract-Design-Textures",
};

// Free reuses §02's palette family directly (blue → violet).
export const FREE_HALO: HaloPalette = {
  base: [0.655, 0.769, 0.91],
  hot: [0.96, 0.98, 1.0],
  warm: [0.66, 0.33, 0.97],
  cool: [0.33, 0.59, 0.93],
};

// Paid — first-pass warm → iridescent magenta. Tune in Task 13.
export const PAID_HALO: HaloPalette = {
  base: [0.95, 0.78, 0.55],
  hot: [1.0, 0.95, 0.9],
  warm: [0.98, 0.46, 0.18],
  cool: [0.85, 0.27, 0.7],
};
