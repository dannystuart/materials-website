# Demo-caption overlay (§05) — v3 motion design

**Date:** 2026-05-29
**Status:** Supersedes v2. v2 was built and rejected on sight — the caption sat static above the closed laptop, didn't animate in, shrank (stopped reading as a heading), and the rest/overlap behaviour was wrong. This is the corrected choreography from a second brainstorming pass with the user.

## What the user wants (verbatim intent)

A heading-sized caption that:
1. **Reveals** (blur/fade-up, hero-style) on scroll as the section enters — sitting **higher up**, animating in like the hero header. (v2 didn't visibly animate.)
2. **Rises** on scroll as the video scrubs — moving **up**, with **plenty of padding** between it and the video block (v2 was too cramped). **Stays a big heading — no shrinking** (v2 shrank and stopped reading as a heading).
3. When the video **ends and the replay button appears**, moves **back down** to sit just above the replay text.
4. When **replayed**, moves **back up** again — toggling **between the two positions** on play/end.

## Locked decisions (brainstorming round 2)

- **Down position (ended):** the heading descends OVER the video's upper area to sit just above the centred replay overlay ("Want another look?" / Replay). Overlapping the dark ended-overlay is intended.
- **Scrub framing:** the video stays pinned to the top as today (existing scrub recipe untouched). The heading rises up and **off the top edge** as the video scrubs, then returns into view (drops to above-replay) once the video ends and the block is back in normal flow.
- **Size:** one heading size throughout — `text-[56px]` desktop (matches §05 H2), `text-3xl` mobile. **No scale animation** — only `translateY`.
- **Mobile:** word-reveal only — no rise-off, no play/end toggle. Static fallback under reduced motion.

## Architecture

Caption stays a flow sibling **above** the video frame inside `data-macbook-demo` (from v2 Task 1), `z-10`, `pointer-events-none`, with generous bottom padding so a clear gap separates it from the video. Because it's `z-10` and `position: relative`, a positive `translateY` paints it over the video frame (no need to live inside the `overflow-hidden` frame) — that's how it reaches the DOWN position.

All caption transform is owned by GSAP in `useMacbookScrub.ts` (single owner, no React/GSAP transform fight). The component keeps owning the overlay UI (`overlayShown`, `handlePlay`, `onEnded`).

## Positions (translateY; 0 = natural flow position above the video)

- **Reveal baseline / UP:** `y = 0` — heading above the video, padding gap below. Words blur-fade in here.
- **Rise-off (pin scrub):** `y: 0 → −(caption height)` so it clears the top edge. Scrubbed/reversible. Reverts to 0 on pin disable.
- **DOWN (ended):** `y = +D`, where `D` is measured so the heading sits above the centred replay overlay (≈ gap + ~28% of video height; tune in-browser).

## Motion (desktop) — all inside the existing `deferGsap` block

1. **Reveal (scrubbed):** trigger block `start: "top bottom"` → `end: "top center"`, `scrub`. Animate words + eyebrow `opacity 0→1`, `blur(10px)→0`, `y 14→0`, stagger. Container untouched (stays `y:0`). Hidden states via `gsap.set`, never `data-reveal`.
2. **Rise-off (scrubbed, in the pin timeline):** tween caption `y: 0 → −captionH` over the first ~50% of the pinned scrub, so it's gone before the lid is fully open. The pin timeline also scrubs `video.currentTime` (unchanged). `onLeave` disable/revert returns caption `y` to 0 (= UP) — no extra handling.
3. **Playback toggle (event listeners on the video, added in the hook):**
   - `play` → `gsap.to(caption, { y: 0 })` (UP). Covers both the post-scrub auto-play and replay.
   - `ended` → `gsap.to(caption, { y: D })` (DOWN, above replay overlay).
   - Desktop-only; cleaned up on unmount.

## Reduced motion

Hook bails (`enabled: !reduced`). Caption renders static at `y:0` (big heading above the video). No reveal, rise, or toggle. Play-button overlay present.

## Mobile

Word-reveal only (the scrubbed reveal runs on all widths). Rise-off and play/end toggle are `isDesktop`-gated. Caption is `text-3xl`, stays above the small video. No code beyond the desktop gates.

## Constraints (binding, unchanged)

- Never `data-reveal` on the caption; hidden states via `gsap.set` only.
- All ScrollTrigger/timelines inside the existing `deferGsap` block; pin/`onLeave` recipe untouched except the caption rise-off tween.
- Plain white, no gradient word.
- Reduced-motion fallback required.
- Desktop-led: verify 1440 first.
- Verify: smoke-test → `visual-reviewer` (desktop first) until PASS.

## Tuning notes (expect in-browser iteration)

The exact `D` (down distance), the rise-off fraction of the pin, the padding gap, and whether the UP position should sit slightly inside the video top edge (for visibility during the play/end toggle) are visual-tune values — land the structure, then refine against the running page and user feedback.
