# Demo-caption overlay (§05) — REVISION after first visual test

**Date:** 2026-05-29
**Status:** First implementation built & merged on branch `feat/section-05-close`, then visually rejected by the user. This doc captures the revised choreography. **Start the next session by brainstorming the open questions below, then re-plan, then re-implement.**

## Where things stand (already built — keep or rework)

Branch `feat/section-05-close`. Three commits landed the v1 caption + a green check gate:
- `src/components/section-05/MacbookDemo.tsx` — caption markup: `[data-demo-caption]` with `[data-demo-caption-eyebrow]` (`APPLIED`) and six `[data-demo-caption-word]` spans (`A few Materials, on real work.`). Motion/static variants by `reduced`. Test: `MacbookDemo.test.tsx` (3 passing).
- `src/components/section-05/useMacbookScrub.ts` — the scrub/pin hook. v1 Beat 1 = per-word reveal on a standalone scrub trigger (`top bottom`→`top top`); v1 Beat 2 = caption rise+shrink+fade folded into the pin timeline (first 25%). Both inside the existing `deferGsap` block.
- Gate fixes (unrelated pre-existing debt, keep): ResizeObserver stub in `src/test/setup.ts`; set-state-in-effect refactors in `RecipeOutput.tsx` + `MacbookDemo.tsx`; removed unused `isTouch`/`STROKE`.

The markup is probably fine; **the motion (both beats) needs rework** per below. Copy unchanged (`APPLIED` / `A few Materials, on real work.`), plain white, no gradient word.

v1 design doc: `docs/plans/2026-05-29-demo-caption-overlay-design.md`. v1 plan: `docs/plans/2026-05-29-demo-caption-overlay-plan.md`. This revision supersedes their motion spec.

## What's wrong with v1 (with evidence)

Screenshots in `docs/`:
- `Screenshot 2026-05-29 at 08.49.39.png` — early/poster state: caption ~57% down the frame, just above the **closed** lid; type too small (~40px desktop / 30px mobile); "real work." still blurred — the reveal only completes at the pin point, not as the block rises toward centre.
- `applied_materials_design_build_deploy_screenshot.png` — mid-scrub: the **open** laptop screen ("Design, build & deploy" on a Material) and the caption **overlap** — caption is sitting on top of the screen content. Wrong.

## Revised choreography (intent — confirm specifics in brainstorming)

1. **Reveal: bigger + higher + earlier.**
   - Caption type should be **large, matching the other big headings** (§05 H2 is `text-[56px]` semibold, tracking `-0.0334em`). v1's 40px reads small. Go up to ~56px (or larger) on desktop.
   - The per-word fade-up/de-blur reveal (hero word-reveal feel — keep that) should **complete as the demo block rises toward the vertical centre of the viewport**, not as late/low as v1 (which finishes right at the top/pin). Caption should read as fully-present while the block is around centre, not down near the closed lid.

2. **Lid-push rise during the video.**
   - As the video scrubs and the **macbook lid opens**, the caption should **translate upward, staying above the opening lid — as if the lid is pushing it up.** It must **never overlap the laptop screen content.**
   - It shrinks as it rises (gets smaller on the way up). Reads as the caption being lifted out of the way by the hardware.

3. **Final rest: smaller, above the video, one-way.**
   - The caption comes to rest **smaller, ABOVE the video block** — in the gap between the video and the **previous section** (§ above). Not over the macbook.
   - At this final stage the effect is **one-way**: once it has revealed/settled it must **not keep fading in/out reversibly on scroll**. (v1 is fully scrub-reversible, which causes the "fades back in on top of the video" artefact the user dislikes.)

## Open questions to resolve in brainstorming (DO THIS FIRST next session)

1. **Final resting position vs the pin.** "Above the video, between it and the previous section" — does the caption end up *outside* the pinned block, in normal page flow above it? Pinning fixes the block to the top of the viewport, so "above the video" during the pin = above the viewport top (off-screen) unless the rest position is the top *edge* of the pinned block. Clarify exactly where it rests and relative to what. This drives whether the caption stays inside `MacbookDemo` or moves to a wrapper.
2. **One-way + scrubbed pin reconciliation.** The pin/video scrub is inherently reversible. A one-way final fade can't be pure scrub. Options to weigh: a non-scrub `ScrollTrigger` with `toggleActions: "play none none none"` (or `once: true`) for the settle, layered over the scrubbed lid-push; or split the caption motion off the scrub entirely. Decide the mechanism.
3. **Does the lid-push track the actual video frames** (lid angle) or just approximate with a scroll-progress translate? (Tracking real lid geometry is hard; an eased upward translate keyed to scrub progress is likely enough — confirm it reads as "pushed up".)
4. **Exact sizes:** reveal size (56px? larger?), rest size (how small — a caption/label scale?), and the eyebrow's treatment through the motion.
5. **Reduced motion:** restate the static fallback for the new resting position (v1 was static top-left; may need updating to "small, above video").
6. **Mobile:** user said **leave mobile as-is** for the earlier crowding issue — but the new choreography (bigger type, lid-push, rest-above) needs a mobile story too. Confirm how much of this applies at 375px (block is only ~188px tall there).

## Constraints (unchanged, still binding)
- `data-reveal` trap: never put `data-reveal` on the caption; hidden states via `gsap.set` only.
- Every ScrollTrigger/timeline wrapped in `deferGsap` (serialised one-per-rAF). New triggers go in the same deferred block as the pin where possible.
- Plain white caption, no gradient word (saves §05's one-per-section allowance).
- Reduced-motion fallback required (hook already bails the scrub when `reduced`).
- Desktop-led: 1440 is primary; verify desktop first.
- Verify protocol: smoke-test in-browser, then `visual-reviewer` (desktop first) until PASS. Confirm Playwright availability first; skip+flag if blocked.

## Recommended next-session flow
1. `superpowers:brainstorming` on the open questions above → lock the choreography.
2. `superpowers:writing-plans` → revised bite-sized plan (supersede the v1 plan's motion tasks).
3. Implement (subagent-driven to keep context lean — user wants main-thread context under ~50%).
4. Gate (lint/test/build) + smoke test + visual-reviewer loop.
