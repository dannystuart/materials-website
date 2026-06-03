# Mobile Review: Full page — post-amends session
URL: http://localhost:3000
Date: 2026-06-03
Reviewer: mobile-reviewer subagent

---

## Verdict
NEEDS_ITERATION

Three items require action before this is shippable: the §05 blue top glow is not visibly rendering, the §03 library toggle buttons are 35px (below 44px minimum), and the footer links are 20px (below 44px). Everything else either passes or is a subjective judgment flagged for Dan.

---

## 375×667 — PRIMARY

### Best practices

- [x] **No horizontal scroll / overflow** — PASS. All section boxes are exactly 375px wide. The carousel tracks use `overflow-x-auto` correctly contained within `overflow-hidden` sections. No page-level overflow detected.

- [x] **24px gutters (`px-6`)** — PASS. All content columns start at x=24, end at x=351 (375-24). Section headings, lede text, and card containers all respect the gutter. One exception: the recipe formula row (`no-scrollbar...px-6 scroll-px-6`) is correctly full-bleed with internal 24px padding.

- [ ] **Tap targets ≥44×44px — FAIL (2 locations)**
  1. **§03 Library toggle buttons** ("Stills", "Loops", "Templates"): measured at 35px tall (`[24,46,86,35]`, `[116,46,88,35]`, `[209,46,121,35]`). All 9px under the 44px minimum. Fix: add `py-2.5` or `min-h-[44px]` to the button class in `LibraryPlateStack.tsx` (currently `px-4 py-2`; bump to `py-[11px]`).
  2. **Footer nav links** ("Site →", "Threads →", "Say hi →"): the nav wrapper inside `FooterPill` is 20px tall (`[81,563,213,20]`). The pill outer div is 44px (`h-11`) but `flex items-center` on the pill only centres the nav, leaving the nav's own height at content-height (20px). Fix: add `h-full` to the `<nav>` element in `FooterPill.tsx` so it stretches to fill the 44px pill, giving each link a full 44px tap area.

- [x] **Text clipping / orphans** — PASS. No overflow or unexpected truncation observed. The §02 lede has `max-w-[40ch]` creating a narrow column; text wraps cleanly. §04 headline ("Type something. / Pick a Material. / That's the whole recipe.") breaks across three lines at `t-display` (40px), all fit within 327px. §05 pack card inventory lists wrap correctly within 261px. No single-word orphaned lines observed.

- [x] **Type legibility** — PASS. `t-mega` at 44px for §02 headline, `t-display` at 40px for §03/§04/§05, `t-h2` at 32px for §06. Scale is sensible for 375px. Body `t-body` at 16px is readable. No oversized headings jammed into narrow columns.

- [x] **Fixed/sticky CTA pill** — PASS (with note). The pill starts at `opacity: 0` and only fades in when scrolled near §02 (driven by `useScrollReveal`). At page load, the pill is invisible — so the hero wordmark at y=48 (which is within the pill's position range at y=20–72) is not actually covered. Once scrolled, the wordmark has scrolled away. No collision. The "Buy" button inside the pill is `min-h-[44px]` on mobile and measures 44px tall in the snapshot. PASS on tap target. Safe-area insets: the pill is at `top-4` (16px). This could be too close to the notch on devices with Dynamic Island. UNCLEAR — no explicit `env(safe-area-inset-top)` accommodation seen. Flag for device testing.

- [x] **Media scales** — PASS. Hero video has radial mask, fills section with no distortion. Library video has `library-video-mask` and fills its container. Footer video is `w-[94vw] max-w-[500px]` — scales proportionally. No letterboxing observed.

- [x] **`prefers-reduced-motion` fallback** — PASS. All animated components check `useReducedMotion()`. Hero, §02, §03, §04, §05, footer all have explicit `if (reducedMotion) { ... return }` branches that snap to end state.

- [x] **Section jobs land on mobile** — PASS. All six sections render their core content and are not hidden or restructured. §02 carousel shows hub + two cards. §03 library shows plate + testimonial. §04 recipe shows formula row + caption. §05 shows both pack cards + testimonial. §06 shows three FAQ items. Footer shows wordmark + nav + copyright.

### Aesthetics

- [x] **Vertical rhythm** — PASS. Spacing between sections is consistent. `pt-20 pb-24` on most sections gives generous breathing room. Gap between heading and carousel in §02 feels deliberate. §05 card gap of 48px (`gap-12`) between cards is appropriate.

- [x] **Visual hierarchy** — PASS. Eyebrow → headline → lede → interactive content hierarchy is clear in all sections. The gradient-word accent in each section provides a focal colour point without competing with structure.

- [x] **Balance & alignment** — PASS. The page reads as editorial/catalogue on mobile. Left-aligned body text and headings are consistent. The hero wordmark's centering is intentional and clean. §06 FAQ items are left-aligned correctly. No accidental centred-SaaS-template drift detected.

- [x] **Line length** — PASS. Lede text in §02 with `max-w-[40ch]` reads at ~40 chars per line. §05 pack card feature list items are short bullets. §06 FAQ body text runs to approximately 55–60 chars, which is within acceptable reading range at 16px.

- [x] **Breathing room around focal elements** — PASS. The hub graphic in §02 has generous space above and below. Pack cards in §05 have sufficient top padding before inventory lists. Recipe formula has clear vertical separation from headline.

- [x] **Brand fidelity** — PASS. Cool dark chrome throughout (no warm atmospheric backgrounds). Plus Jakarta Sans confirmed throughout (no serif, no mono). Gradient-word accent appears correctly in §02 ("Material" — creative gradient), §03 ("160" — library gradient), §04 ("Material" — shimmer gradient). Element box in §02 hub (014/Ic/IRIDESCENT) is visible and correctly styled. No element boxes floating without grid lines — the hub orbits serve as the grid context for §02.

---

## Changes verified — by item

### §01 Hero wordmark (#6)
PASS. Wordmark measures 146px wide (`img [box=115,48,146,30]`). Centered: (375-146)/2=114.5≈115. Correct width, correctly centered. Previously larger/left-aligned behavior is gone.

### §02 Pitch carousel (#1)
PASS with note. Cards swipe with snap, captions are not clipped (caption box fits within card height). Second card peeks on the right — measured at approximately 56px of peek (the container is 327px, card is 255px=78%, leaving ~72px minus the gap). The specified "~20px peek" is closer to 50-60px in practice because the carousel can't scroll left of zero for the first card — it starts flush left with no left margin. The peek is functional and readable, just wider than specified. The two glow connector lines from hub to cards ARE visible as warm orange/amber trails in the screenshots. Active/inactive brightness difference exists (first card line is brighter when first card is active). Connector lines render correctly.

### §03 Library entrance animation removed (#2)
PASS. The `matchMedia("(max-width: 767px)")` branch correctly sets `progressRef.current = 1` and calls `applyLayout(false)`, forcing the resting fanned pose immediately. The plate tiles appear at full opacity in their resting fanned arrangement — no scroll-triggered entrance on phones. The STILLS/LOOPS/TEMPLATES toggle buttons shuffle the active tile when tapped (verified via accessibility snapshot showing `aria-pressed` state).

TAP TARGET FAIL noted above: toggle buttons are 35px tall.

### §04 Recipe horizontal scroll (#3)
PASS. The formula row (`Prompt card → + → Material carousel → = → Result card`) scrolls horizontally with snap. The "+" operator at `[333,412,27,44]` — 44px tap height, PASS. Caption "Scroll to see the result →" is present at the bottom of the section (`paragraph [ref=e236]`). The section outer div has `px-6` gutter; the carousel track uses `scroll-px-6 px-6` which correctly offsets the snap start position. Caption paragraph has `px-6` in class. Confirmed at both widths.

### §05 Close — blue top glow (#4) — HIGH PRIORITY
**GLOW IS NOT VISIBLY RENDERING.**

Across all viewport screenshots taken at multiple scroll positions, no blue glow is visible above either pack card. The area between the "Two ways in." heading and the first card's top edge (approximately 48px gap where the glow should peak) appears as uniform `#010100` dark with no blue cast.

**CSS analysis:** The syntax is correct — `rgba(var(--atmosphere-blue-close), 0.4)` with `--atmosphere-blue-close: 96, 142, 224` (comma-separated) produces valid `rgba(96, 142, 224, 0.4)`. No syntax bug. The `isolate` stacking context chain is correct: outer `relative isolate` wrapper → `-z-10` glow div → PackCard with its own `relative isolate`. The glow should render between the section background and PackCard.

**Likely cause — geometry:** The glow div's radial gradient is `80% 70% at 50% 0%`, where `50% 0%` is the TOP-CENTER of the glow div. The glow div is positioned at `-top-14` (-56px), so the gradient centre is 56px above the card top. With `blur(44px)`, the glow spreads ±44px. But the gradient also fades from `rgba(96,142,224, 0.4) → rgba(96,142,224, 0.16) → transparent 72%`. Combined with `h-[58%]` of the containing block (PackCard height), the effective visible peak intensity above the card top is extremely diffuse. Against `#010100`, even a 0.4-alpha blue should be perceptible — but the blur+gradient combination may be reducing it to ≤2–3% opacity at the visual peak.

**Recommended fix:** Either (a) increase alpha from 0.4 to at least 0.65–0.75 and remove or reduce the blur to `blur(28px)`, OR (b) reposition the glow div closer to the card top edge (`-top-8` instead of `-top-14`) so more of the gradient mass sits above the card. A quick test: temporarily set `background: rgba(96,142,224,0.8)` flat colour on the glow div to confirm it renders at all, then dial back.

**Recommended alpha if geometry is kept:** 0.65+ to read reliably. At the current 0.4 with blur(44px) it is effectively invisible in production screenshots.

### §05 Footer video yo-yo (#5b)
UNABLE TO CONFIRM MOTION. The yo-yo mechanism (GSAP proxy scrubbing `video.currentTime`) cannot be verified through static screenshots. No stutter was visually evident in the footer screenshot (smooth material render is visible). The code logic is sound — GSAP `repeat: -1, yoyo: true` on a proxy object driving `video.currentTime`. Potential stutter depends on the keyframe density of `footer-960.mp4`. Mark this as "needs live device testing for smoothness."

### §05 Footer wordmark above pill (#5a)
PASS. The wordmark (`img "Materials" [box=88,457,200,41]`) is clearly above the FooterPill nav (`[81,563,213,20]`), with a 106px vertical gap between them. The copyright is at the bottom (`[59,632,258,11]`). The ordering is correct — wordmark → pill → copyright — with no overlap or collision.

### Floating CTA pill inset (#7)
PASS. The pill outer div is `h-[52px]` at mobile. The inner "Buy" button has `min-h-[44px]`, measuring 44px in the snapshot. This gives a 4px inset (52-44=8px, split as 4px top and 4px bottom). The intent of "small inset from pill edge" is achieved. The visual distinction between pill boundary and button boundary is present.

---

## 390×844

Consistent with 375 in layout and proportions. Notable deltas:
- Wordmark centered at x=122 (390-146)/2=122. PASS.
- CTA pill centered at x=91 (`navigation "Buy" [box=91,20,218,44]`). PASS.
- Pack cards scale to 342px wide at 390 (`[24,y,342,720]`); gutters preserved at 24px.
- Library toggle buttons still 35px tall — same FAIL as 375.
- Footer nav links still 20px — same FAIL as 375.
- §04 recipe section shows full headline at 390 (scroll-triggered animations have more room with 844px viewport height). Section reads clearly.
- §05 blue glow: same non-rendering result confirmed at 390.
- Footer: wordmark centered at x=95 (`img "Materials" [box=95,3513,200,41]`). PASS. Video visible, atmosphere blue at bottom, layout correct.

---

## 360×640
Not checked — nothing was tight at 375 that would justify it.

---

## Console
- `THREE.Clock` deprecation warning — bundled Three.js, not actionable. Background noise.
- Next.js LCP warning: `/stills-card.png` should use `loading="eager"` — minor performance improvement, not a visual bug. Add `priority` prop to the Next.js `<Image>` component that renders this image in `LibraryPlate.tsx`.
- 0 errors.

---

## Specific changes recommended

**FAIL — must fix:**

1. **§03 Library toggles (tap target):** In `LibraryPlateStack.tsx` button class, change `px-4 py-2` to `px-4 py-[11px]` (adds 3px each side, bringing height to 41px) or add `min-h-[44px] flex items-center` to ensure 44px minimum. The current `py-2` gives `8px × 2 + ~18px text = 34-35px`. Target: `py-[13px]` → `13×2 + 18 = 44px`.

2. **Footer links (tap target):** In `FooterPill.tsx`, add `h-full` to the `<nav>` element: `className="relative flex items-center h-full gap-3 md:gap-4 text-[13px] md:text-[14px]"`. This stretches the nav to the pill's `h-11` (44px), giving each `inline-flex items-center` link a 44px tap height.

3. **§05 Blue top glow (not rendering):** In `SectionCloseMobile.tsx`, the glow is present in the DOM but visually invisible. Two recommended changes:
   - Reduce blur from `blur(44px)` to `blur(24px)` to concentrate the glow
   - Increase alpha from `0.4` to `0.65` at the peak, `0.25` at the mid stop: `rgba(var(--atmosphere-blue-close), 0.65) 0%, rgba(var(--atmosphere-blue-close), 0.25) 42%, transparent 65%`
   - Optional: reduce `-top-14` to `-top-10` to move the glow peak closer to the card top edge, increasing visible contact area

**UNCLEAR — flag for Dan:**

4. **CTA pill and Dynamic Island:** The pill is at `top-4` (16px from top). On iPhone 15 Pro (Dynamic Island variant) the safe area inset top is ~54px. The pill might overlap the Dynamic Island. Add `top-[max(16px,env(safe-area-inset-top))]` or `pt-safe` to the pill if you target real devices. Outside scope of this review but worth noting.

5. **§02 carousel first-card peek is wider than specified (~56px vs ~20px):** The first card can't be scroll-snap-centred because you can't scroll left of zero. The right-side peek of card 2 is approximately 50-60px, not ~20px. This is a known carousel edge-case. If tighter peek is desired, consider adding a hidden 0-width snap-align-start sentinel at the left edge, or use `scroll-padding-left` differently. For now the wider peek is functional and doesn't look broken.

6. **LCP image in §03:** `loading="eager"` / `priority` prop on the `stills-card.png` `<Image>` in `LibraryPlate.tsx` would resolve the Next.js LCP warning.
