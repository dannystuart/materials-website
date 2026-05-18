# Floating CTA pill — design

Locked decisions from brainstorm (questions Q1–Q5):

- **Trigger:** appears once hero is scrolled past; disappears on scroll-up back into hero (Q1: A).
- **Position:** top-centre, floating ~20px from top edge (Q2: A).
- **Composition:** label on the left, single button on the right (Q3: A).
  - Left text: `Materials¹ — Edition 1`
  - Button: `Buy →` (no price in chrome)
- **Hover treatment:** magnetic pull on the button + iridescent radial ripple emanating from cursor's pill-entry point (Q5: C).

---

## 1. Composition & visual treatment

### Geometry

- Single capsule. Fully rounded ends (`border-radius: 999px`).
- Desktop height: **48px**. Internal padding: **6px** left/right, with the inner button hugging its own internal padding.
- Min-width: content-driven; expect ~340–380px on desktop with locked copy.
- Two visual zones inside the capsule: left = label, right = button. Hairline vertical divider between them at 1px, `rgba(255,255,255,0.12)`. The divider is decorative — not a hard structural border.

### Surface (at rest)

- Background: `rgba(8, 8, 12, 0.72)` with `backdrop-filter: blur(20px) saturate(140%)`. Dark glass — *cool*, in line with the "Materials are the only heat source" rule.
- 1px iridescent hairline border, drawn via a gradient stroke (purple → orange, sampled from the hero accent). At rest it sits at ~35% opacity so it reads as a quiet edge, not a glow.
- Outer drop shadow: `0 10px 40px rgba(0,0,0,0.5)` — grounds the pill in space without warm light bleed.
- **Idle pulse:** the iridescent border alpha breathes between 0.30 ↔ 0.45 on a 4s loop. Subliminal "this is alive". Disabled in reduced-motion.

### Typography inside the pill

- Left label: Plus Jakarta Sans, 14px, weight 500, letter-spacing 0, colour `rgba(255,255,255,0.85)`. The `¹` superscript matches the hero wordmark treatment.
- Button label: 14px, weight 600, white. Arrow `→` is a single character (U+2192), tracked 4px from the word.

### Button (at rest)

- Background: `#FFFFFF` with `mix-blend-mode: normal` — solid white pill-within-pill. Reads as the one decisive thing on the page.
- Text colour: `#0A0A0F` (near-black to match hero-bg).
- Border-radius: 999px. Padding: `9px 16px`.

---

## 2. The hover sequence

The whole sequence is **cursor-driven**, not state-driven. No `:hover` toggles — pointer events feed continuous values into GSAP tweens.

### 2a. Pill-entry ripple (the "wow" moment)

- On `pointerenter`, capture the pointer's `(x, y)` relative to the pill.
- Spawn a radial gradient ripple from that exact point. Gradient: `radial-gradient(circle at var(--ripple-x) var(--ripple-y), rgba(168, 85, 247, 0.35) 0%, rgba(249, 115, 22, 0.20) 30%, transparent 70%)`.
- Animate `--ripple-radius` from 0 → 140% of pill width over 700ms, `power2.out`. Opacity from 0.9 → 0 across the same curve.
- The ripple is clipped to the pill's rounded shape (`overflow: hidden` on the pill, or an SVG mask).
- **Exit ripple:** on `pointerleave`, fire a second, smaller, inverse ripple from the cursor's exit point — half the amplitude, 400ms. This is the unusual bit: most floating CTAs do nothing on exit. We close the gesture.

### 2b. Magnetic button pull

- While the pointer is inside the pill, the button translates toward the cursor by **max 4px** on x and **2px** on y.
- Implementation: `requestAnimationFrame` loop that lerps current → target position at 0.18 per frame. Target is `(cursor.x - buttonCenter.x) * 0.08` clamped to [-4, 4].
- The `→` glyph independently translates an extra 2px to the right while pointer is inside the pill (so the arrow "leans into" the gesture, even when the cursor isn't on the button itself).
- On `pointerleave`, the lerp continues to zero — no snap.

### 2c. Surface response

- Border iridescence ramps from 0.35 → 0.85 opacity over 250ms while pointer is inside the pill.
- Backdrop-filter `saturate` ramps 140% → 180%. Subtle — pushes the iridescent border colours further when the eye is already there.
- Button micro-scales: 1.00 → 1.04 over 200ms while pointer is inside the *button* specifically (not the pill).

### What we are deliberately NOT doing

- No magnetic pull on the entire pill (only on the button). The pill stays anchored — magnetic capsules feel cheap and have been done.
- No shimmer-line sweep across the surface. The ripple replaces it; doing both is busy.
- No colour shift on the button itself. It stays white. The iridescence lives on the perimeter and in the ripple, where it belongs.

---

## 3. Scroll-driven appearance

- Anchor: a `ScrollTrigger` on the hero element. Pill is `opacity: 0; translateY: -12px; pointer-events: none` at top.
- Trigger fires when hero bottom passes ~85% of viewport.
- Animate `opacity` 0 → 1, `y` -12 → 0 over 400ms, `power2.out`. `pointer-events` flip to `auto` on complete.
- Reverse plays on scroll-up.
- **Reduced motion:** opacity-only, instant, no slide. Idle pulse disabled.

---

## 4. Mobile (375px)

- Same anchor: top-centre, **16px** from top (clears safe-area-inset).
- Height: **40px**. Reduced padding.
- Left text: full `Materials¹ — Edition 1` if it fits (it should at ~340px). If not, truncate to `Materials¹`.
- No magnetic pull (no hover). On **tap**, fire a single ripple from the tap point and run the button's 1.04 scale on `:active`. This preserves the "one delightful gesture" without requiring hover.
- Tap target: button is ≥44px tall via padding even though pill is 40px. Achieved with negative margins extending the hit area.
- 24px gutters preserved when the pill sits near the edges in landscape.

---

## 5. Accessibility & semantics

- The pill is `<nav aria-label="Buy">` containing one `<a href="#buy">` (or the eventual Gumroad link).
- Idle pulse and ripple effects are decorative — wrapped in `aria-hidden` containers.
- Focus state: when tabbed to, the button gets a 2px iridescent focus ring (sampled from the same gradient) at 80% opacity, no shift. Focus mimics hover's surface response but skips the magnetic pull.
- Keyboard activation triggers the same exit ripple (treat space/enter as a "gestural click").
- All animation respects `prefers-reduced-motion` via the existing `useReducedMotion` hook.

---

## 6. Implementation plan

### File structure

```
src/components/floating-cta/
  FloatingCta.tsx          # main component
  useMagneticPointer.ts    # rAF lerp + ripple coords hook
  useScrollReveal.ts       # ScrollTrigger reveal/hide
```

### Mounting

- Mounted in `src/app/page.tsx` *outside* `<main>`, as a sibling to it — so it's not constrained by main's flow. Or as a portal target if SSR hydration mismatch becomes an issue.

### State / refs

- One ref to the pill root, one to the button, one to the arrow glyph.
- Two CSS custom properties drive the ripple: `--ripple-x`, `--ripple-y`, `--ripple-radius`, `--ripple-opacity`.
- Magnetic offset stored as a ref (mutable), updated in rAF, applied via `gsap.set` on the button.

### Timeline ownership

- Reveal/hide: one GSAP timeline driven by ScrollTrigger.
- Ripple: a function that builds and plays a fresh tween on each pointer enter/leave.
- Magnetic loop: imperative rAF, no GSAP — lighter and pre-emptable.

---

## 7. Open questions for after build

- **Real buy URL.** Currently a placeholder anchor. Will need a Gumroad/Stripe link when product is live.
- **Edition 1 phrasing.** May need to evolve when Edition 2 ships. Holding for now.
- **Pill on §03 / §04+.** Currently appears once after hero and persists. If a future section has its own pinned CTA, we'll need to consider hand-off.

---

## 8. Two motion moments?

The CLAUDE.md rule: two motion-heavy moments per page, max. Status:

1. Hero on-mount + scroll-out (existing).
2. §02 pitch diagram interactions (existing).

The floating CTA's hover is **micro-motion** — gesture response, not a motion *moment*. It only fires on user interaction and lives in screen chrome, not in the content. I'm classifying it as ambient/UI feedback, not a third motion moment. Flag if you disagree.
