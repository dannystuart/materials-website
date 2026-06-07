/**
 * Canonical production origin and site identity.
 *
 * Override the origin per-environment with NEXT_PUBLIC_SITE_URL (e.g. a Vercel
 * preview deployment URL); it falls back to the launch domain. Everything
 * SEO-facing — metadataBase, canonical, robots, sitemap, OG image URLs — reads
 * from here so there is a single source of truth.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://vanta.supply";

/**
 * The site / brand / publisher name — the umbrella, not the product.
 * Surfaces as og:site_name, applicationName, and the JSON-LD Organization +
 * WebSite. The product itself ("Materials¹ — Edition 01") is carried by the
 * page title and the JSON-LD Product, sourced from packData.
 */
export const SITE_NAME = "Vanta Supply";

/**
 * One-line product/site description. Single source for the page meta
 * description (layout) and the JSON-LD product description so the two can't
 * drift.
 */
export const SITE_DESCRIPTION =
  "160 abstract Materials — stills, looping video, and transparent PNGs. For your design work as much as your AI work. $9, paid once.";
