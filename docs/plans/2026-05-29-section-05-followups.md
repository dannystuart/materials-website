# §02–§05 follow-ups (surfaced during §05 caption review)

**Date:** 2026-05-29
**Source:** mobile + visual review of the §05 demo-caption rework (branch `feat/section-05-close`). The caption work itself passed at desktop and mobile; these two issues are pre-existing / adjacent and were deferred to a separate session.

---

## Issue 1 — Page-wide horizontal scroll (~90px) — PRIORITY

**Symptom.** The page pans sideways on mobile:
- 375px: `document.scrollWidth ≈ 465` vs viewport 375 (~90px overscroll).
- 390px: ≈ 485 vs 390 (~95px).
- 360px: ≈ 445 vs 360.

**Cause.** Decorative WebGL-glow / Material-plate layers use large negative insets with **no clipping ancestor**, so they extend past the viewport and create horizontal scroll. Cited offenders (confirm by grepping):
- Pack-card glow canvases: `pointer-events-none absolute -inset-[35%] -z-10` (likely `PackHalo.tsx` / `PackCard.tsx`).
- Plate siblings: `-inset-20 -z-[5]`, `-inset-16 -z-[6]`.
- §02–§04 image plates: `-inset-[18%]`.
- ~13 such layers page-wide; hiding all of them collapses `scrollWidth` to exactly the viewport width. §05 owns ~7 (the two pack-card glow canvases + plate siblings).
- The §05 `<section>` (`relative bg-hero-bg pb-20 text-white`) has no `overflow-x` control; same for the other affected sections.

**Affected sections:** §02–§05 (shared bug, not §05-specific).

**Recommended fix.** Add horizontal clipping to a clipping ancestor of these layers — prefer `overflow-x-clip` (doesn't create a scroll container or disturb `position: sticky`/pinning) over `overflow-x-hidden`. Candidates: each affected `<section>`, the per-card glow wrapper, or a single page-level wrapper in `src/app/page.tsx`.

**Cautions.**
- The page uses GSAP `ScrollTrigger` **pinning** on §05's MacBook scrub (and possibly elsewhere). `overflow-hidden` on an ancestor can break ScrollTrigger pinning; `overflow-x-clip` is safer but **must be verified** — pin the §05 demo and scroll through after the change.
- A page-level `overflow-x-clip` is the smallest blast radius but verify it doesn't clip any intentional full-bleed/− glow that is meant to bleed vertically.

**Acceptance.** At 375/390/360: `document.scrollWidth === document.documentElement.clientWidth` (no horizontal pan), AND the §05 desktop scrub/pin still works, AND no decorative glow is visibly clipped in a way that looks broken.

---

## Issue 2 — Empty "ended" demo state (§05)

**Symptom.** The §05 MacBook demo video ends on a near-black, closed-lid frame. When playback ends, the replay overlay ("Want another look?" / "Replay demo") floats over an empty black box — reads as broken/unfinished. Present at desktop and all mobile widths.

**Cause.** On `ended`, the component shows the overlay over the video's last (black/closed) frame. The poster `public/videos/macbook-demo-poster.jpg` shows the *open* laptop with a Material on screen — a much better backdrop.

**Recommended fix (small, in `src/components/section-05/MacbookDemo.tsx`).** When the ended overlay is shown, render the poster image as a fill layer behind the overlay (e.g. an `<img src="/videos/macbook-demo-poster.jpg">` or a background, `object-cover object-bottom` to match the video), so the overlay sits on a filled, on-brand frame instead of black. Don't disturb the desktop scrub recipe (the `onLeave` currentTime save/restore in `useMacbookScrub.ts`) — this is purely the ended/overlay presentation.

**Acceptance.** After the demo ends (auto-play on desktop, or play-then-end on mobile), the replay overlay sits over the open-laptop poster, not a black void. Desktop scrub still scrubs the video frames as before.

---

## Minor notes (optional)
- **Reduced motion:** confirm `prefers-reduced-motion: reduce` swaps the §05 caption to the static variant (dual `lg:hidden` / `hidden lg:block` DOM is in place; just verify the RM branch renders the static copy and the scrub bails).
- **Emoji bullets** in the pack-card contents lists (🖼 📹 ✨ 🧰 ⚡ 🙋) read slightly off against the periodic-table/grid-line identity. Owner decision — keep (warm/casual) or replace with the element-box/tick system.
