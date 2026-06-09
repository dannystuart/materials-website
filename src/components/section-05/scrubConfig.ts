// Shared scrub geometry for the §05 Macbook demo.
//
// The demo block is `position: sticky` inside a travel wrapper that is exactly
// this many pixels taller than the block (MacbookDemo renders a spacer child
// sized by `--scrub-travel`), and the scrub trigger's `end` covers the
// same distance (useMacbookScrub). Both read the SAME number from here so the
// CSS travel and the scrub range can never drift apart. The travel is real,
// permanent layout — the document's height never changes at the scrub→playback
// handoff, which is what keeps the handoff jump-free on every browser (see
// docs/scroll-scrubbed-video-recipe.md).
export const SCRUB_PX = {
  desktop: 800,
  mobile: 500,
} as const;
