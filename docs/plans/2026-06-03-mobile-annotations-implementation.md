# Mobile Annotations (1–8) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement 7 mobile-only UI amendments (annotations 1–4, 6–8) on the Materials¹ landing page, captured at 375px, without altering the desktop (≥1024px) experience.

**Architecture:** Each `Section*` component renders a `*Desktop` and `*Mobile` variant gated by Tailwind `lg` (1024px). Most changes live in the `*Mobile` variants (mobile-by-architecture). Four touch *shared* components (`HeroLogo`, `PackCard`'s host, `LibraryPlateStack`, `MaterialsWordmark`, `FloatingCta`) and MUST be scoped with a breakpoint (`lg:` / `md:`) or `matchMedia` so desktop is untouched.

**Tech Stack:** Next.js 16 (App Router) · React 19 · Tailwind v4 · GSAP 3 (`useGSAP` + `ScrollTrigger`, `deferGsap`) · R3F (react-three-fiber, used by existing carousels) · pnpm · vitest.

---

## NON-NEGOTIABLE GUARDRAILS

1. **Mobile only.** Per Dan: *"all of these changes including pitch carousel and recipe scroll are MOBILE ONLY, do not change anything for desktop."* After any task that touches a **shared** component, smoke-test desktop at **1440** to confirm zero visual change.
2. **#7 is phones-only (<768px).** Tablet (768–1023) keeps the plate-stack entrance animation; desktop keeps it.
3. **Reduced motion.** Every motion-driven element needs a `prefers-reduced-motion` fallback (`useReducedMotion` hook exists). Scroll-snap carousels are user-driven and allowed under reduced motion, but any *auto*-animation (footer yo-yo, caption arrow) must freeze/disable.
4. **`[data-reveal]{opacity:0}` trap.** Any element marked `data-reveal` is invisible until a GSAP tween (or the reduced-motion CSS override) un-hides it. Don't strand elements invisible. `LibraryPlateStack` plates do NOT use `data-reveal` — they have an *in-component* opacity-lerp trap instead (see Task 6).
5. **Tap targets ≥44px** (CLAUDE.md mobile standing check). The CTA fix must preserve this.
6. **Tokens, not raw px** where a token exists. Atmosphere blue = `--atmosphere-blue-close: 96, 142, 224` (use as `rgb(var(--atmosphere-blue-close) / α)`). `lg` = 1024. Type via `t-*` classes.
7. **Design-system locks.** Hero wordmark desktop = 292px (must survive). No palette extension, no second typeface, no new warm atmosphere.

## VERIFICATION PROTOCOL (per task)

This is visual/motion work — the gate is **browser + reviewer**, not unit tests:
1. `pnpm dev` running → load `http://localhost:3000`, set viewport to **375** (and **390**), scroll/exercise the section. (Smoke-test yourself FIRST — non-negotiable per CLAUDE.md.)
2. For shared-component tasks: also check **1440** desktop = unchanged.
3. Type-check / lint: `pnpm lint` (and `pnpm build` once at the end, or after the two complex carousels).
4. After the batch of mobile reworks, run the **`mobile-reviewer`** subagent (CLAUDE.md mandates it for any mobile rework). Act on clear findings; surface design judgments to Dan.
5. Commit per annotation (conventional commits, `feat:`/`fix:`).

Unit tests (vitest) are only worthwhile for the small pure helpers noted inline (e.g. center→opacity mapping, yo-yo time clamp) — optional, not required.

---

## Task 0: Shared prep — `.no-scrollbar` utility

Both new carousels (Tasks 1 & 2) need a scrollbar-free horizontal scroller.

**Files:**
- Modify: `src/app/globals.css`

**Step 1:** Add a reusable utility (near the other component utilities):

```css
/* Horizontal scroll containers (mobile carousels) — hide the scrollbar,
   keep the scrolling. */
.no-scrollbar {
  -ms-overflow-style: none;     /* IE/Edge */
  scrollbar-width: none;        /* Firefox */
}
.no-scrollbar::-webkit-scrollbar {
  display: none;                /* WebKit */
}
```

**Step 2:** Verify Turbopack picks up the new selector (known stale-CSS gotcha — restart dev server if `.no-scrollbar` doesn't apply).

**Commit:** `chore(css): add .no-scrollbar utility for mobile carousels`

---

## Task 1 (Annotation 1, PRIORITY 1): Pitch §02 — swipe carousel + two swipe-tracked glowing lines

**Decision:** *Two lines, swipe-tracked* (faithful). Keep the orbits+hub diagram at top. Below it, a horizontal **scroll-snap carousel** of the two cards with the next card **peeking**. An SVG overlay draws **two glowing connector lines** (reusing the desktop `GlowConnector` visual) from the hub down to each card's top-center; both endpoints **track the carousel scroll position live**, and each line's brightness follows how centered its card is.

**Mobile-only:** all edits in `SectionPitchMobile.tsx` + new mobile-only components. The one shared touch is *extracting* `GlowConnector` to a shared module (pure refactor; desktop output must stay byte-identical — verify at 1440).

**Files:**
- Create: `src/components/section-02/PitchConnector.tsx` (extracted shared `GlowConnector` + `WARM`/`COOL`/`HOT` consts)
- Modify: `src/components/section-02/PitchDiagram.tsx` (import `GlowConnector` from the new module instead of the inline local — no output change)
- Create: `src/components/section-02/PitchMobileCarousel.tsx` (scroll-snap track of the two cards + the SVG connector overlay)
- Modify: `src/components/section-02/SectionPitchMobile.tsx:154-171` (replace the stacked cards with `<PitchMobileCarousel />`)

**Current mobile layout (to replace):**
```tsx
<div className="relative mt-14 flex flex-col items-center gap-10">
  <div ref={diagramRef} className="relative flex aspect-square w-full max-w-[400px] items-center justify-center">
    <PitchMobileOrbits pointer={pointer} />
    <div data-reveal="hub"><PitchHub size={260} /></div>
  </div>
  <div data-reveal="card" className="w-full"><PitchDesignOutput /></div>
  <div data-reveal="card" className="w-full"><PitchAIOutput /></div>
</div>
```

**Step 1 — Extract the connector (DRY, shared visual).** Move the `GlowConnector` function + `WARM/COOL/HOT` consts out of `PitchDiagram.tsx` into `PitchConnector.tsx` and export them. It already takes `{id, x1, y1, x2, y2, startColor, endColor}` props — no API change. Update `PitchDiagram.tsx` to import them. **Verify desktop §02 at 1440 renders identically** (the two static connectors fade in on scroll exactly as before).

**Step 2 — Build the carousel shell** in `PitchMobileCarousel.tsx`:
- A `relative` wrapper containing (a) the orbits+hub diagram (moved here, same as current) and (b) the scroll-snap track below it.
- Track: `flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth` with horizontal scroll-padding so the active card centers and the next peeks (~`px-[11%]`, card width ~`min-w-[78%]`, `snap-center` on each card). Two children: `PitchDesignOutput`, `PitchAIOutput` (the shared cards, unchanged).
- Give the hub and each card a `ref`.

**Step 3 — Connector overlay** (the hard part) in the same component:
- An `<svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">` over the wrapper, sized in CSS pixels (measure wrapper via `ResizeObserver` → set `viewBox="0 0 w h"` in px so coords are 1:1).
- Render **two** `<GlowConnector>` (from Task 1 Step 1): `conn-design` (WARM→HOT) and `conn-ai` (HOT→COOL), matching desktop's color assignment.
- Endpoints, recomputed on scroll (rAF-throttled `scroll` listener on the track, passive):
  - Start = hub bottom-center (read hub ref rect relative to the SVG rect — roughly constant).
  - End (per card) = that card's **top-center** (read card ref rect relative to SVG rect). As the track scrolls, the centered card's end sits under the hub (near-vertical line); the peeking card's end is off to the side (angled line) — exactly the chosen preview.
- **Brightness:** compute each card's center-x distance from the track's visual center; map to group opacity (centered ≈ 1.0, fully off ≈ 0.35) via a small pure helper `centerProximityToOpacity(distancePx, halfWidthPx)` — *worth a tiny vitest test*. Apply as the connector `<g>` opacity.
- **Entrance:** keep the desktop-style fade-in (the connectors start hidden and fade/stagger in once when the section enters — reuse the existing reveal pattern; or simply fade the SVG group from 0→1 on first intersection).

**Step 4 — Reduced motion:** if `useReducedMotion()` is true, skip the rAF scroll-tracking loop and draw both lines static at the rest layout (card A centered). Carousel still swipes (user-driven). Ensure `data-reveal` cards are visible (the global reduced-motion CSS already resets `[data-reveal]` to opacity 1).

**Step 5 — Wire into `SectionPitchMobile.tsx`:** replace lines 154-171's stacked block with the diagram-now-inside-carousel `<PitchMobileCarousel pointer={pointer} />`. Keep `diagramRef`/`pointer` plumbing for the orbits parallax + the section reveal timeline. Make sure the carousel cards still satisfy whatever `data-reveal="card"` the section timeline expects (either keep the attribute on the track items or move the reveal onto the carousel container).

**Verify:** 375 — orbits+hub on top; swipe between the two cards with the next peeking; a glowing line runs from the hub to the centered card (bright) and a dimmer one trails to the peeking card; lines slide and swap brightness as you swipe. No console errors. Reduced-motion: lines static, swipe still works. **Desktop 1440 §02 unchanged.**

**Commit:** `feat(section-02): mobile swipe carousel with swipe-tracked glow connectors`

> **Note (motion budget):** this adds interaction-driven motion to mobile §02. It's swipe-driven (not ambient autoplay) and is the mobile adaptation of an existing desktop feature, so it's within spirit — but flag to Dan if it reads as too busy next to the orbit shader.

---

## Task 2 (Annotation 2, PRIORITY 2): Recipe §04 — horizontal-scroll formula, snap stations + peek + caption

**Decision:** *Snap stations + peek.* Convert the vertical mobile formula to a horizontal scroller reusing the row order `[Prompt] + [carousel] = [Result]`. At rest the Prompt tile sits with the `+` peeking; scroll snaps station-to-station; add a caption *"Scroll to see the result →"*.

**Mobile-only:** all edits in `SectionRecipeMobile.tsx`. Desktop row untouched.

**Files:**
- Modify: `src/components/section-04/SectionRecipeMobile.tsx:212-249` (the `rowRef` block) + add a caption element.

**Current (vertical, to change):**
```tsx
<div ref={rowRef} className="relative mt-12 flex flex-col items-stretch gap-3 px-6" data-row="recipe">
  <div data-reveal="tile"><RecipeInputType ... variant="mobile" /></div>
  <div data-reveal="op" className="flex justify-center" ...><RecipeOperator symbol="+" size="md" /></div>
  <div data-reveal="tile" className="self-center"><RecipeCarousel ... variant="mobile" /></div>
  <div data-reveal="op" className="flex justify-center" ...><RecipeOperator symbol="=" size="md" /></div>
  <div data-reveal="tile"><RecipeOutput ... variant="mobile" /></div>
</div>
```

**Step 1 — Horizontal scroller:** change the `rowRef` container to `relative mt-12 flex items-center gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar` and **drop the `px-6`** (gutters become scroll-padding instead: `scroll-px-6 px-6` so the first/last stations align to the 24px gutter). Remove the per-operator `flex justify-center` + negative margins (those were for vertical centering).

**Step 2 — Station sizing + peek:** give the Prompt and Result tiles a fixed mobile width so one fills the viewport with the next element peeking — e.g. wrap each station in `snap-center shrink-0`. Prompt/Result ≈ `w-[78vw] max-w-[300px]`; operators `shrink-0`; the `RecipeCarousel` mobile container (~360px) stays its own `snap-center shrink-0` station. Confirm `RecipeTile` mobile height (`h-[240px]`) reads well; widen if the prompt text wraps poorly.

**Step 3 — Caption:** below the scroller add:
```tsx
<p className="mt-4 px-6 t-caption text-white/45">Scroll to see the result <span aria-hidden /* arrow, animated */>→</span></p>
```
Animate the arrow with a small looping nudge (GSAP or CSS `@keyframes`), **disabled under reduced motion** (static arrow). Caption is informational — no `data-reveal` needed (or include it in the section reveal if you want it to fade in).

**Step 4 — Preserve existing behavior:**
- Keep the `data-reveal="tile"`/`"op"` attributes — the existing `useGSAP` formula-row timeline (`SectionRecipeMobile.tsx:84-160`, `trigger: rowRef, start: "top 90%"`) fades them up. The y:28→0 + opacity stagger works in a horizontal flex too; verify it still un-hides them (no strand).
- The `RecipeCarousel` R3F auto-cycle is gated by an IntersectionObserver on `rowRef` (threshold 0.2). `rowRef` is now a horizontal scroller but still intersects the viewport vertically when the section scrolls in — confirm `demoStarted` fires and the deck animates + result cross-fades.

**Step 5 — Reduced motion:** scroll-snap is user-driven (OK). Ensure the caption arrow is static and the existing reduced-motion reveal path sets tiles/ops visible.

**Verify:** 375 — formula reads left-to-right; at rest Prompt + a sliver of `+` show; swiping reveals carousel then `= Result`; caption present; snap feels right. Carousel still cycles + result cross-fades. No console errors. Reduced motion OK. **Desktop §04 unchanged.**

**Commit:** `feat(section-04): mobile horizontal-scroll formula with snap stations + caption`

---

## Task 3 (Annotation 3, PRIORITY 3): Floating CTA — mobile pill padding

**Problem (not missing padding):** the pill is `h-11` (44px) with **no vertical padding**, and the Buy button is `min-h-[44px]` → the button fills the pill edge-to-edge ("touching the top edges, looks huge"). Desktop (`md:`) is fine: `h-12` pill + `min-h-0`/`py-[9px]` button.

**Decision:** grow the **mobile** pill so the 44px button gets dark inset; keep the button ≥44px (tap-target rule).

**Mobile-only:** every CTA value is a base utility with a separate `md:` override — change base only, leave `md:` alone.

**Files:**
- Modify: `src/components/floating-cta/FloatingCta.tsx` (root pill ~line 64; button ~line 92)

**Step 1 — Grow the mobile pill:** change root height `h-11 md:h-12` → `h-[52px] md:h-12` (4px inset top/bottom around the 44px button). If 4px reads tight in smoke-test, bump to `h-14` (56px → 6px inset). Keep `pl-3 md:pl-4 pr-1 md:pr-1.5` (or nudge `pr-1` → `pr-1.5` for symmetry if needed).

**Step 2 — Confirm button:** keep `min-h-[44px]` (mobile tap target). Do NOT shrink below 44px. The inset now comes from the taller pill.

**Verify:** 375 — Buy button sits centered in the pill with visible dark inset above/below; no longer touches edges; tap target still ≥44px. **Desktop (`md:`, 1440) unchanged** (still `h-12`).

**Commit:** `fix(floating-cta): give mobile pill height so Buy button gets inset`

---

## Task 4 (Annotation 4, PRIORITY 4): Close §05 — per-card blue top glow on mobile

**Context:** desktop's blue glow is a single *cluster* glow behind the side-by-side cards (`SectionCloseDesktop.tsx:23-47`). Mobile stacks the cards vertically, so a single glow would only light the top card. **Decision:** port it as a **per-card top glow** (blue, lighting both).

**Mobile-only:** edit `SectionCloseMobile.tsx` only. Do NOT modify the shared `PackCard` (no breakpoint prop on it — wrapping in the section is cleaner and desktop-safe).

**Files:**
- Modify: `src/components/section-05/SectionCloseMobile.tsx` (the `mt-12 flex flex-col gap-12` card stack)

**Desktop glow values to mirror (tune for a single card):** `radial-gradient(60% 54% at 50% 32%, rgba(96,142,224,0.26), rgba(96,142,224,0.11) 44%, transparent 74%)`, `blur(56px)`.

**Step 1 — Wrap each card** with a `relative isolate` container and drop an `aria-hidden`, `pointer-events-none`, `-z-10` glow layer biased to the **top** of the card:
```tsx
{[PAID_PACK, FREE_PACK].map((pack) => (
  <div key={pack.variant} className="relative isolate">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-14 left-1/2 -z-10 h-[55%] w-[118%] -translate-x-1/2"
      style={{
        background:
          "radial-gradient(70% 60% at 50% 0%, rgb(var(--atmosphere-blue-close) / 0.30) 0%, rgb(var(--atmosphere-blue-close) / 0.12) 45%, transparent 75%)",
        filter: "blur(48px)",
      }}
    />
    <PackCard pack={pack} />
  </div>
))}
```
(Use the **token** `var(--atmosphere-blue-close)` — desktop hard-codes the literal; mobile can be cleaner.) Exact `-top`, `h`, `w`, blur, and alpha are **tunable in smoke-test** — the goal is a cool bloom rising at each card's top, complementing each card's existing warm bottom glow.

**Step 2 — Sanity:** the paid card's own warm orange bloom must still read; the blue is a *top* accent, not a wash. No `mix-blend-mode` (desktop doesn't use one here).

**Verify:** 375 — each card has a subtle blue glow at its top edge; both cards lit (not just the first); warm card glows intact. **Desktop §05 unchanged.**

**Commit:** `feat(section-05): add per-card blue top glow to mobile pack cards`

---

## Task 5 (Annotation 6, PRIORITY 5): Footer — yo-yo the material video + raise the logo above the menu

**Two sub-fixes, mobile only** (`FooterMobile.tsx`; desktop footer is mouse-scrubbed, untouched).

**Files:**
- Modify: `src/components/footer/FooterMobile.tsx` (loop effect ~31-43; logo wrapper ~102-104; pill ~106-108)

### 5a — Yo-yo instead of hard loop
**Current:** `video.loop = true; video.playbackRate = 0.4; video.play()` — jump-cuts end→start. Dan wants forward→reverse→forward ("turning back and forth").

**Step 1:** Remove `video.loop = true` and the `.play()` call. After `loadedmetadata` (duration known), drive `currentTime` with a GSAP yo-yo tween on a proxy object:
```tsx
const state = { t: 0 };
const tween = gsap.fromTo(
  state,
  { t: 0 },
  {
    t: video.duration,
    duration: video.duration / 0.4, // preserve the 0.4× feel
    ease: "none",
    repeat: -1,
    yoyo: true,
    onUpdate: () => { video.currentTime = state.t; },
  }
);
// cleanup: tween.kill();
```
(Plain tween — **no** `deferGsap` needed; that's only for `ScrollTrigger.create`/scrollTrigger timelines.)

**Step 2 — Reduced motion:** keep current behavior — seed `currentTime` to `duration/2` and create **no** tween (frozen mid-frame).

**Step 3 — Robustness:** setting `currentTime` per frame on a short muted mp4 is the same technique the desktop scrub uses, so it's precedented — but verify smoothness at 375 in-browser (and ideally a real device). If it stutters, reduce update cadence or confirm `/videos/footer-960.mp4` is encoded with frequent keyframes. *(Optional tiny vitest: a `clamp`/ping-pong time helper if you extract one.)*

### 5b — Raise the wordmark above the pill
**Current:** logo wrapper and pill **both** `z-10`; logo (vertically centered, `items-center`) is rendered *before* the pill (`bottom-[30%]`), so the later, near-opaque pill (`bg-[rgba(8,8,12,0.72)]` + blur) **paints over** the wordmark. Dan: *"hidden behind the menu… raise that up a little bit. I made the logo a little bit smaller"* (already `w-[200px]`).

**Step 4:** Bump the logo wrapper to `z-20` (paints above the pill) **and** nudge it up so it clears the pill rather than overlapping it — change `flex h-full items-center justify-center px-6` → `flex h-full items-start justify-center px-6 pt-[clamp(20px,11vw,52px)]` (push into the upper area). Exact offset **tunable in smoke-test** — target: wordmark sits clearly above the menu pill, fully visible.

**Verify:** 375 — material video plays forward then smoothly reverses (no jump-cut); wordmark fully visible above the menu pill (not occluded). Reduced motion: video frozen mid-frame, logo visible. **Desktop footer unchanged.**

**Commit:** `fix(footer): yo-yo mobile material video + raise wordmark above menu`

---

## Task 6 (Annotation 7, PRIORITY 6): Library §03 — disable plate-stack entrance below 768px

**Decision:** *Phones only (<768px).* The Stills/Loops/Templates plate tiles have a **scroll-scrubbed entrance** in the **shared** `LibraryPlateStack.tsx` (renders on phone, tablet, AND desktop). Disable on phones; keep tablet (768–1023) + desktop.

**Trap:** plates do NOT use `data-reveal` (no CSS trap), BUT `computeTarget` returns `opacity: 0` at progress 0. If you `return` early without forcing the resting pose, the plates stay invisible. Replicate the existing `reducedMotion` branch.

**Files:**
- Modify: `src/components/section-03/LibraryPlateStack.tsx` (the scrub `useEffect`, ~136-159)

**Step 1 — Add a phones guard** mirroring the codebase's `matchMedia` idiom (`useMacbookScrub.ts:37` uses `window.matchMedia("(min-width: 1024px)")`). At the top of the scrub effect, alongside the `reducedMotion` early-return:
```tsx
const isPhone =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 767px)").matches;

if (reducedMotion || isPhone) {
  progressRef.current = 1;
  applyLayout(false);   // land plates at full-opacity resting pose
  return;
}
```
(Reading `.matches` once on effect run matches the existing idiom. Live 768px crossings are an accepted edge case.)

**Verify:** 375 — plate tiles appear in their final fanned/resting pose with **no** scroll-driven entrance; fully visible (not stuck at opacity 0); click-to-shuffle still works. **800 (tablet) and 1440 (desktop)** — entrance animation still runs. No console errors.

**Commit:** `fix(section-03): disable plate-stack entrance animation on phones (<768px)`

---

## Task 7 (Annotation 8, PRIORITY 7): Hero logo — half size + center on mobile

**Decision:** mobile wordmark ≈ half (146px), centered; desktop locked at 292px.

**Mobile-only:** `HeroLogo` is shared, so scope the width with `lg:`. The locked desktop 292px must survive (`HeroDesktop` renders `HeroLogo` at ≥1024 where `lg:` applies).

**Files:**
- Modify: `src/components/hero/HeroLogo.tsx`
- Modify: `src/components/hero/HeroMobile.tsx` (logo wrapper, ~line 25)

**Step 1 — Width:** `HeroLogo.tsx` —
```tsx
<MaterialsWordmark className="w-[146px] lg:w-[292px] h-auto text-white" />
```
(146 = half of 292; `lg:w-[292px]` re-asserts the design-system lock for desktop.)

**Step 2 — Center on mobile:** `HeroMobile.tsx` logo wrapper `<div className="z-30">` → `<div className="z-30 flex justify-center">` (mobile-only component, so no `lg:` guard strictly needed; harmless to add).

**Verify:** 375 — wordmark ~146px wide, horizontally centered in the 24px gutter. **1440 — wordmark 292px, left-positioned, unchanged** (this is the design-system lock; confirm explicitly).

**Commit:** `fix(hero): halve + center hero wordmark on mobile (desktop locked 292px)`

---

## Suggested execution order

Priority order is 1→8 as above. They're **independent** — but for momentum, the quick mechanical wins (Tasks 3, 7, then 5b, 6) can land first, leaving the two net-new carousels (Tasks 1 & 2) for focused sessions. The two carousels share `.no-scrollbar` (Task 0 — do first if starting with either carousel).

## Post-implementation

- `pnpm build` clean.
- Run **`mobile-reviewer`** subagent over §02, §03, §04, §05, footer, hero, CTA at 375/390.
- Smoke-test **1440 desktop** end-to-end to confirm the shared-component touches (Tasks 1, 6, 7) caused zero desktop change.
- Update memory `project_materials_landing` with the mobile-amends state.

---

## ▶ Session progress — 2026-06-03 (✅ COMPLETE — all 7 shipped + verified; see completion note at end)

**Branch:** `feat/design-system-foundation`. The Session-2 `t-*` token migration was committed first as a clean base (`2950191`), then `.no-scrollbar` (`970f386`). All work below builds on those.

**Done & committed** (verified in-browser at 375 unless flagged):
- **#1 Pitch carousel + 2 swipe-tracked glow lines** — `2cdded0` + sizing fix `9e433f5` + code-review fix `e4ab2ca`. Verified: cards swipe with a peek, both glow lines track scroll + swap brightness, **desktop §02 byte-identical at 1440**, 0 console errors, build/lint/test green. Code-quality reviewed (approved). New files: `PitchConnector.tsx` (extracted GlowConnector), `PitchMobileCarousel.tsx`, `pitchConnectorGeometry.ts` (+test).
- **#2 Recipe horizontal-scroll formula** — `9716c59`. Verified: Prompt → + → carousel(R3F) → = → Result snap-stations + peek + "Scroll to see the result →" caption; R3F deck renders + auto-cycles; desktop untouched. Added `.recipe-scroll-arrow` keyframe to globals.css.
- **#3 CTA pill height** — `243e1ca`. Verified: pill 52px, button 44px, 4px inset, tap target ≥44px preserved.
- **#8 Hero logo** — `19613a6`. Verified: 146px, centered at 375; `lg:w-[292px]` protects the desktop lock.
- **#4 Close per-card blue glow** — `b80ad84`. ⚠ **CSS fix confirmed to PARSE only — NOT yet visually confirmed to render, alpha `0.4` provisional.** Was invisible due to the token-syntax bug (see gotcha below). **Action: confirm it renders + tune alpha in the mobile-reviewer pass.**

**Remaining work:**
- **#6 Footer** (`FooterMobile.tsx`, mobile-only): replace `video.loop = true` with a GSAP proxy yo-yo tween writing `video.currentTime` (`repeat:-1, yoyo:true`, duration = `video.duration / 0.4` to keep the 0.4× feel); reduced-motion keeps the current frozen-at-`duration/2` behaviour (no tween). Raise the wordmark wrapper `z-10`→`z-20` + nudge it up (`items-start` + `pt-[clamp(...)]`) so it clears the `FooterPill`. Plan §Task 5.
- **#7 Library** (`LibraryPlateStack.tsx`, SHARED component): in the scrub `useEffect`, add a `window.matchMedia("(max-width: 767px)").matches` guard **alongside** the existing `reducedMotion` early-return — set `progressRef.current = 1; applyLayout(false); return;` (MUST force the resting pose or plates strand at opacity 0). Phones only; tablet (768–1023) + desktop keep the entrance. Plan §Task 6.

**Then (verification gate):**
1. Run **`mobile-reviewer`** subagent once over §02/§03/§04/§05/footer/hero/CTA at 375 + 390 — this is also where the **#4 glow gets its visual confirm + alpha tune**, and #6's footer yo-yo motion is judged.
2. Full **desktop pass at 1440** confirming shared-component touches (#1 extraction, #4 token, #7 guard, #8 logo) changed nothing.
3. `pnpm build` clean → then superpowers:finishing-a-development-branch.

**Gotchas learned this session (don't relearn):**
- **Atmosphere-token syntax:** `--atmosphere-blue-*` tokens are *comma-separated* triples → use `rgba(var(--token), α)`, NOT `rgb(var(--token) / α)` (the form design-system.md suggests) — the latter is invalid CSS and the browser silently drops the colour. This made #4's glow invisible at every alpha. See memory `feedback_atmosphere_token_rgba`.
- **Flex carousel sizing:** a card with `min-w-[X%] shrink-0` grows to its content's intrinsic width (overflows the viewport, clips captions). Use `w-[X%] min-w-0 shrink-0` so the flex item honours the width and a `w-full` child conforms. Applied in #1 and #2.
- **Playwright lock:** a leftover MCP Chrome from a prior session holds `~/Library/Caches/ms-playwright/mcp-chrome-*/SingletonLock` → "Browser is already in use". Kill the stale PID to free it. Only one Playwright instance at a time, so the controller must `browser_close` before a `mobile-reviewer` subagent runs.
- **Verify via subagents, not main-thread screenshots** — main-thread Playwright screenshots balloon context fast; delegate visual checks to `mobile-reviewer`.

---

## ✅ 2026-06-03 — session complete

All 7 annotations shipped on `feat/design-system-foundation` and verified. Commits: `c4c7422` (#7 library phones guard), `618df5d` (#6 footer yo-yo + wordmark lift), `8d41559` (mobile-reviewer fixes), `e3443d9` (review doc) — on top of the earlier `2cdded0`/`9e433f5`/`e4ab2ca` (#1), `9716c59` (#2), `243e1ca` (#3), `19613a6` (#8), `b80ad84` (#4 first pass).

- **#4 glow:** the `b80ad84` version was still invisible (`0.4` + `blur(44px)` spread too thin against near-black). Re-tuned to `0.6` + `blur(28px)` with the bright centre just above the card edge (`8d41559`); **confirmed rendering in-browser at 375**.
- **mobile-reviewer (375/390):** ran once → `docs/reviews/2026-06-03-mobile-amends-review.md`. Caught two tap-target FAILs now fixed `lg:`-scoped (library toggles 35→45px via `py-[13px] lg:py-2`; footer links 20→44px via `py-3 lg:py-0` — `FooterPill` is shared with desktop).
- **Desktop 1440 regression:** byte-identical, confirmed by in-browser measurement — toggles 35px, footer links 21px, hero wordmark CSS 292px. (The hero intro animation reads `opacity:0` under Playwright automation — a pre-existing deferGsap/ScrollRestore artifact, **not** a regression; the locked hero plays fine for real users and the mobile reviewer saw the 375 hero correctly.)
- **`pnpm build`:** green (compiled 2.2s, TS pass, 4/4 static pages, 0 errors).

**Open for Dan (surfaced by the reviewer, deliberately NOT auto-fixed — scope/judgment calls):**
1. §02 carousel first-card peek is ~56px, not the ~20px spec — honouring it needs a left sentinel element (can't snap-centre the first card without scroll-left-of-zero). Functional as-is.
2. Floating CTA pill has no `env(safe-area-inset-top)` guard → would overlap the Dynamic Island on notched phones. One-line fix if wanted.
3. §03 `stills-card.png` is the LCP element and wants Next's `priority` prop (perf hint).
- Plus: footer video yo-yo is code-correct but `currentTime`-scrubbing of `footer-960.mp4` may stutter on older devices — needs a real-device check.

**Branch NOT merged** — left for Dan's call (mid design-system arc).
