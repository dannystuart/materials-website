# Demo-caption overlay (§05) — v2 motion design

**Date:** 2026-05-29
**Status:** Choreography locked in brainstorming. Supersedes the motion spec in `2026-05-29-demo-caption-overlay-design.md` and the REVISION doc's open questions. Copy unchanged (`APPLIED` / `A few Materials, on real work.`), plain white, no gradient word.

## Decisions (from brainstorming)

1. **Rest position:** the caption rests *truly above the video block*, in the band between §04 and the video. It is acceptable for that rest spot to be off-screen above the viewport while the video is pinned — it is visible in normal page flow whenever the user scrolls back up. → caption must live **outside** the video's `overflow-hidden` frame.
2. **Mechanism:** *split.* Beat 1 (per-word de-blur reveal) stays **scrubbed** to scroll; Beat 2 (rise + shrink to rest) fires **once, forward-only**. Kills the v1 overlap + reversible re-fade artifacts.
3. **Mobile:** simple per-word reveal only — **no** rise/shrink/park (block is ~188px tall). Full choreography is desktop-only.

## Architecture

The caption moves out of the video's `overflow-hidden aspect-[2/1]` frame and becomes an **in-flow sibling above** the video inside `data-macbook-demo`:

```
data-macbook-demo (relative)
 ├─ [data-demo-caption]   ← in normal flow, small = REST position (gap above video)
 └─ div.aspect-[2/1].overflow-hidden  (video + play-button overlay)
```

The caption's natural (untransformed) layout position **is** its rest position. The big reveal is a pure `transform` (scale up + translateY down) that visually lifts it over the video centre — transforms don't affect layout, so the video never shifts and the rest gap is always reserved. `pointer-events-none`, `z-10` so it sits over the video during the reveal.

## Sizes (desktop)

- Baseline DOM (= rest): line ~28px semibold, tracking `-0.0334em`; eyebrow `APPLIED` 11px caps, tracking `0.28em`, `text-white/70`.
- Reveal: `scale ~2.0` (line ≈ 56px, matching the §05 H2 `text-[56px]`), `transform-origin: top center` so it grows toward the video.
- translateY-down distance for the reveal is **computed in JS** from the measured video height (`getBoundingClientRect`) so it stays centred over the video responsively; final value tuned in-browser.

## Motion timeline (desktop)

All triggers live in the existing `deferGsap` block in `useMacbookScrub.ts`, alongside the pin.

**Beat 1 — reveal (scrubbed, reversible).**
- Trigger: block, `start: "top bottom"` → `end: "top center"`, `scrub`.
- Container is `gsap.set` at build to its big+over-video transform (scale ~2.0, translateY down). NOT via `data-reveal` (global `[data-reveal]{opacity:0}` trap).
- Timeline animates **words + eyebrow** only: `opacity 0→1`, `filter blur(10px)→0`, `y 14→0`, `stagger` (hero word-reveal 1:1).
- Net: block rises bottom→centre, caption de-blurs into full presence — big, centred over the video. Completes at centre (earlier + higher + bigger than v1).

**Beat 2 — rise + settle (once, forward-only).**
- Trigger: block, `start: "top top"` (pin engage), `once: true`.
- Animates the **container transform** big+over-video → identity (`scale 1, y 0`), ~0.6s `power2.out`.
- Caption rises + shrinks to rest above the video, clearing before the lid meaningfully opens. `once` → never descends back over the video.

No GSAP property conflict: Beat 1 targets words/eyebrow, Beat 2 targets the container.

**Reverse scroll:** Beat 2 stays parked (rest, above video). Beat 1 may re-blur the words as the block exits toward the bottom, but the container is parked above the video — no overlap, no re-fade over the laptop.

## Reduced motion (desktop)

Caption rendered statically at its rest position (small, above the video), no blur/transform, fully visible. Pairs with the existing play-button overlay path (scrub hook already bails when `reduced`).

## Mobile

Per-word de-blur reveal once, caption sits clear above the laptop. No rise/shrink/park. Static fallback under reduced motion. Leave the existing mobile scrub/pin behaviour otherwise as shipped.

## Constraints (binding)

- `data-reveal` trap: never on the caption; hidden states via `gsap.set` only.
- Every ScrollTrigger/timeline wrapped in `deferGsap`; new triggers in the same deferred block as the pin.
- Plain white caption, no gradient word.
- Reduced-motion fallback required.
- Desktop-led: 1440 primary; verify desktop first.
- Verify: smoke-test in-browser → `visual-reviewer` (desktop first) until PASS. Confirm Playwright first; skip+flag if blocked.
