# Demo-caption overlay — §05 Macbook demo video

**Date:** 2026-05-29
**Section:** §05 (Close / pricing), the `MacbookDemo` scroll-scrubbed video.
**Status:** Design agreed, ready for implementation plan.

## Problem

Scrolling down into §05, the demo video occupies the viewport for ~1 screen-height
of "approach" before its top reaches the top of the viewport and it pins + scrubs.
During that approach the video just shows its poster frame — a lot of dead space.
We want to use that space to introduce the demo, then get the text out of the way
once the video is scrubbing/playing in full swing.

## Decisions (locked)

- **Choreography:** the overlay text *travels up & out* as the video takes over.
  It is reversible — scrolling back up grows it back down into place. It is not lost
  permanently, but it is gone from view once the video is in full swing.
- **Copy:** eyebrow `APPLIED` + display line `A few Materials, on real work.`
  (Quiet, observational, designer-to-designer. The video shows multiple Materials
  being applied, hence "a few".)
- **Gradient-word accent:** none — plain white. Saves §05's one-per-section
  gradient-word allowance and keeps the beat calm so the video is the star.
- **Motion match:** the reveal is the hero word-reveal, 1:1.

## The effect — two scroll-driven beats on one overlay

A caption overlay is added *inside* the existing `MacbookDemo` block, so it pins
with the video. It is separate from the existing play-button overlay (which is a
different beat: "See the workflow" / "Want another look?" at the end).

### DOM

```
<div data-demo-caption>                    ← absolute, centered over the poster
  <span data-demo-caption-eyebrow>APPLIED</span>
  <p>
    <span data-demo-caption-word>A</span> <span>few</span>
    <span>Materials,</span> <span>on</span> <span>real</span> <span>work.</span>
  </p>
</div>
```

Each word is wrapped in its own span, exactly like `HeroHeadline`, so the reveal
can stagger per word.

### Beat 1 — reveal on approach (the blank-space phase)

A new scrub `ScrollTrigger`:

- `trigger: block, start: "top bottom", end: "top top"` (block climbs from
  viewport-bottom to the pin point).
- Words resolve from `opacity:0, y:14, blur(10px)` → `opacity:1, y:0, blur(0)`
  with a per-word stagger. Same easing/feel as `useHeroTimeline`.

### Beat 2 — rise & shrink on pin

Folded into the **existing pin timeline** in `useMacbookScrub`, over its first ~25%:

- The whole `[data-demo-caption]` container animates `y: -60, scale: 0.82,
  opacity: 0`.
- Because the block is pinned at the top edge, rising + fading reads as "up and
  out". Scrub-driven, so scrolling back up reverses it — the caption grows back
  down into place. Nothing lingers over the video once it's scrubbing.

## Gotchas (both must be handled)

1. **`data-reveal` opacity trap.** Do NOT use the `data-reveal` attribute — the
   global `[data-reveal]{opacity:0}` rule would hide the caption permanently.
   Initial hidden state comes from `gsap.set()` inside the timeline, exactly like
   `HeroHeadline`. The `data-demo-caption-*` attributes are plain hooks, no global
   CSS attached.

2. **`deferGsap` + serialized creates.** Beat 1's new `ScrollTrigger.create` goes
   *inside the same `deferGsap` block* as the existing pin timeline in
   `useMacbookScrub`. Two triggers on one element where one pins is the riskiest
   part — Beat 1's range sits entirely *above* the pin start, so the pin-spacer
   does not shift it, but this must be verified in-browser.

## Reduced motion

`useMacbookScrub` already bails when `reduced` (no pin, no scrub; video plays via
the existing button). In that mode the caption renders as a **static eyebrow + line
pinned to the top-left of the video** (not centered) so it never collides with the
centered play-button overlay. Full opacity, normal flow, no motion.

## Positioning & type

- Caption centered over the poster during approach (the poster reads dark/blank, so
  it carries text well at `aspect-[2/1]`).
- Eyebrow: Plus Jakarta caps + tight tracking (catalog metadata style).
- Display line: §05 headline weight/size family (semibold), all white.

## Files touched

- `src/components/section-05/MacbookDemo.tsx` — add caption markup + reduced-motion
  static variant.
- `src/components/section-05/useMacbookScrub.ts` — add Beat 1 trigger + Beat 2
  keyframes into the existing deferred timeline; querySelector the caption elements
  from `block`.
- No new files; no palette/token additions.

## Verification

Smoke-test by scrolling in-browser first (load + scroll the section manually),
*then* delegate to `visual-reviewer` at 1440 (desktop first) + 375, loop until PASS.

**Playwright / animation caveats for the visual-reviewer step:**

- This beat is scroll-scrubbed motion. Screenshots taken mid-animation will be
  non-deterministic. The reviewer must settle the scroll position and pause/allow
  the animation to reach a stable state before each screenshot (e.g. scroll to a
  precise offset, wait for it to settle, then capture). Capture distinct states
  deliberately: (a) approach mid-reveal, (b) fully revealed at the pin point,
  (c) pinned with caption exited. Do not trust a single ambiguous frame.
- **Confirm Playwright is actually available before relying on it.** If the
  Playwright MCP browser is tied up by another session / already in use:
  - Quick fix: close the stray browser (`browser_close`) or restart the Playwright
    MCP server, then retry once.
  - If it stays blocked, **skip the automated visual review** rather than stall —
    fall back to a manual in-browser smoke test and flag to the user that the
    automated review was skipped because Playwright was unavailable.
```
