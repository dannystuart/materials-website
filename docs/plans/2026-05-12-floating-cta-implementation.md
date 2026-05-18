# Floating CTA Pill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a top-centred floating "Buy" pill that appears once the user scrolls past the hero, with a cursor-driven iridescent ripple, magnetic button pull, and an idle iridescent-border pulse — fully spec'd in `docs/plans/2026-05-12-floating-cta-design.md`.

**Architecture:** A single client component (`FloatingCta`) mounted as a sibling to `<main>` in `src/app/page.tsx`. ScrollTrigger drives reveal/hide via a small hook (`useScrollReveal`). Pointer-driven motion (ripple coords + magnetic offset) is owned by an imperative hook (`useMagneticPointer`) using `requestAnimationFrame` and CSS custom properties — GSAP is reserved for the reveal timeline and the ripple/border tweens. The component is fully chrome: it lives outside content flow and is `aria-hidden` for the decorative bits.

**Tech Stack:** Next.js 16 App Router · React 19 · Tailwind v4 · GSAP 3 (`useGSAP` + `ScrollTrigger` via `@/lib/gsap`) · existing `useReducedMotion` hook · vitest + jsdom + Testing Library.

**Source of truth for visual decisions:** `docs/plans/2026-05-12-floating-cta-design.md`. If a value is ambiguous in this plan, defer to that doc.

---

## Pre-flight

- Read `docs/plans/2026-05-12-floating-cta-design.md` end-to-end before starting.
- Skim `src/components/hero/useHeroTimeline.ts` for the existing ScrollTrigger + `useGSAP` pattern — match it.
- Skim `src/app/globals.css` for the existing gradient values (`#A855F7 → #F97316`). The pill's iridescent border samples from the same stops.
- Note the `data-reveal { opacity: 0 }` global rule (`src/app/globals.css:111-114`). Do **not** put `data-reveal` on the pill root or it will be invisible before GSAP wires up. Use a different marker (`data-cta-root`) for selection.
- Dev server: `pnpm dev` (already running per CLAUDE.md, but restart if Turbopack has stale CSS — see memory `feedback_turbopack_stale_css`).

---

## Task 1: Scaffold component + render at rest

Goal: A static, non-interactive pill renders at the top of the page once scrolled past hero (without scroll logic yet — just always-visible, fixed position). No motion, no hover, no ripple. Pure markup + Tailwind.

**Files:**
- Create: `src/components/floating-cta/FloatingCta.tsx`
- Modify: `src/app/page.tsx` (mount as sibling to `<main>`)
- Modify: `src/app/globals.css` (add `.cta-pill-border` gradient-stroke utility — see Step 3)

**Step 1: Write the render test**

Create `src/components/floating-cta/FloatingCta.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FloatingCta } from "./FloatingCta";

describe("FloatingCta", () => {
  it("renders the label and the buy link", () => {
    render(<FloatingCta />);
    expect(screen.getByText(/Materials/)).toBeTruthy();
    const link = screen.getByRole("link", { name: /Buy/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("#buy");
  });

  it("exposes a nav landmark labelled Buy", () => {
    render(<FloatingCta />);
    expect(screen.getByRole("navigation", { name: /Buy/i })).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
pnpm test src/components/floating-cta/FloatingCta.test.tsx
```

Expected: FAIL — module not found.

**Step 3: Implement the static component**

Create `src/components/floating-cta/FloatingCta.tsx`:

```tsx
"use client";

import { useRef } from "react";

export function FloatingCta() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={rootRef}
      data-cta-root
      className="
        fixed top-5 left-1/2 -translate-x-1/2 z-50
        flex items-center
        h-12 pl-4 pr-1.5
        rounded-full
        bg-[rgba(8,8,12,0.72)]
        backdrop-blur-xl backdrop-saturate-[1.4]
        shadow-[0_10px_40px_rgba(0,0,0,0.5)]
        will-change-transform
      "
      style={{
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
      }}
    >
      {/* Decorative iridescent border — drawn via a pseudo-mask-image gradient. */}
      <span
        aria-hidden="true"
        data-cta-border
        className="cta-pill-border pointer-events-none absolute inset-0 rounded-full"
      />

      <nav aria-label="Buy" className="relative flex items-center gap-3">
        <span className="text-[14px] font-medium tracking-normal text-white/85 select-none">
          Materials<sup className="text-[0.6em] align-super">1</sup> — Edition 1
        </span>
        <span
          aria-hidden="true"
          className="h-5 w-px bg-white/12"
        />
        <a
          href="#buy"
          data-cta-button
          className="
            relative inline-flex items-center gap-1
            rounded-full bg-white text-[#0A0A0F]
            px-4 py-[9px]
            text-[14px] font-semibold
            will-change-transform
            focus:outline-none
          "
        >
          <span>Buy</span>
          <span data-cta-arrow aria-hidden="true" className="inline-block will-change-transform">→</span>
        </a>
      </nav>
    </div>
  );
}
```

**Step 4: Add the iridescent border utility to globals.css**

Append to `src/app/globals.css`:

```css
.cta-pill-border {
  /* Iridescent stroke via mask-composite: paint a gradient, mask out the inside. */
  padding: 1px;
  background: linear-gradient(90deg, #A855F7 0%, #F97316 100%);
  opacity: 0.35;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
}
```

**Step 5: Mount in `src/app/page.tsx`**

Edit `src/app/page.tsx` — add `FloatingCta` as a sibling **outside** `<main>`:

```tsx
import { Hero } from "@/components/hero/Hero";
import { SectionPitch } from "@/components/section-02/SectionPitch";
import { SectionLibrary } from "@/components/section-03/SectionLibrary";
import { FloatingCta } from "@/components/floating-cta/FloatingCta";

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <SectionPitch />
        <SectionLibrary />
        <div style={{ height: "60vh" }} aria-hidden="true" />
      </main>
      <FloatingCta />
    </>
  );
}
```

**Step 6: Run tests + smoke check**

```bash
pnpm test src/components/floating-cta/FloatingCta.test.tsx
```

Expected: PASS.

Then load `http://localhost:3000` in a browser and confirm the pill is visible at top-centre. (Per memory `feedback_verify_before_review`: manually smoke-test before delegating to visual-reviewer.)

**Step 7: Commit**

```bash
git add src/components/floating-cta/ src/app/page.tsx src/app/globals.css
git commit -m "feat(cta): scaffold floating CTA pill at rest"
```

---

## Task 2: Idle iridescent-border pulse

Goal: The border opacity breathes between 0.30 ↔ 0.45 on a 4s loop. Disabled under reduced motion.

**Files:**
- Modify: `src/components/floating-cta/FloatingCta.tsx`

**Step 1: Add the idle pulse via `useGSAP`**

In `FloatingCta.tsx`, import the GSAP hook and `useReducedMotion`, then drive the border opacity:

```tsx
"use client";

import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/components/hero/useReducedMotion";

export function FloatingCta() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const borderRef = useRef<HTMLSpanElement | null>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;
      const border = borderRef.current;
      if (!border) return;

      const tween = gsap.to(border, {
        opacity: 0.45,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      return () => { tween.kill(); };
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  // …existing JSX, attach borderRef to the cta-pill-border span
}
```

Attach `ref={borderRef}` to the `.cta-pill-border` span.

**Step 2: Smoke test**

Reload the page. Confirm the iridescent edge gently breathes. Toggle `prefers-reduced-motion: reduce` in DevTools (Rendering panel) — pulse should stop and border opacity should sit static at 0.35.

**Step 3: Commit**

```bash
git add src/components/floating-cta/FloatingCta.tsx
git commit -m "feat(cta): idle iridescent pulse, reduced-motion safe"
```

---

## Task 3: Scroll-driven reveal/hide

Goal: Pill is hidden + non-interactive at top of page; reveals when hero bottom passes 85% of viewport; reverses on scroll-up. Under reduced motion, opacity-only and instant.

**Files:**
- Create: `src/components/floating-cta/useScrollReveal.ts`
- Modify: `src/components/floating-cta/FloatingCta.tsx`

**Step 1: Implement the hook**

Create `src/components/floating-cta/useScrollReveal.ts`:

```ts
"use client";

import { useGSAP, gsap, ScrollTrigger } from "@/lib/gsap";
import type { RefObject } from "react";

type Args = {
  pillRef: RefObject<HTMLElement | null>;
  reducedMotion: boolean;
};

export function useScrollReveal({ pillRef, reducedMotion }: Args) {
  useGSAP(
    () => {
      const pill = pillRef.current;
      if (!pill) return;

      // Hero is the anchor. It always exists at the top of the page.
      const hero = document.querySelector<HTMLElement>("[data-hero-section]");
      if (!hero) return;

      gsap.set(pill, {
        opacity: 0,
        y: -12,
        pointerEvents: "none",
      });

      if (reducedMotion) {
        ScrollTrigger.create({
          trigger: hero,
          start: "bottom 85%",
          onEnter: () => gsap.set(pill, { opacity: 1, y: 0, pointerEvents: "auto" }),
          onLeaveBack: () => gsap.set(pill, { opacity: 0, y: -12, pointerEvents: "none" }),
        });
        return;
      }

      const tween = gsap.to(pill, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
        paused: true,
        onStart: () => gsap.set(pill, { pointerEvents: "auto" }),
        onReverseComplete: () => gsap.set(pill, { pointerEvents: "none" }),
      });

      ScrollTrigger.create({
        trigger: hero,
        start: "bottom 85%",
        onEnter: () => tween.play(),
        onLeaveBack: () => tween.reverse(),
      });
    },
    { scope: pillRef, dependencies: [reducedMotion] },
  );
}
```

**Step 2: Wire the hook into `FloatingCta`**

In `FloatingCta.tsx`:

```tsx
import { useScrollReveal } from "./useScrollReveal";

// inside component, after refs:
useScrollReveal({ pillRef: rootRef, reducedMotion });
```

Note: there are two `[data-hero-section]` elements (desktop + mobile, see `src/components/hero/Hero.tsx`). `document.querySelector` picks the first in DOM order. Both have the same bottom in practice because only one is visible per viewport, but if the hidden one has different layout it could fire wrong. Verify by scrolling at 1440 and 375 — adjust to `document.querySelectorAll("[data-hero-section]")` and pick the visible one (offsetParent !== null) if needed.

**Step 3: Smoke test**

- Load page. Pill should NOT be visible while in hero.
- Scroll down. Pill should fade + slide in once you cross the hero bottom.
- Scroll back up. Pill should fade + slide out.
- Toggle reduced motion. Verify it's instant (no slide).

**Step 4: Commit**

```bash
git add src/components/floating-cta/
git commit -m "feat(cta): scroll-driven reveal anchored to hero bottom"
```

---

## Task 4: Cursor-driven ripple (enter + exit)

Goal: On `pointerenter`, a radial iridescent ripple emanates from the cursor's pill-entry point. On `pointerleave`, a smaller inverse ripple fires from the exit point. Both clipped to the pill's rounded shape. Disabled under reduced motion.

**Files:**
- Create: `src/components/floating-cta/useMagneticPointer.ts` (will also house magnetic logic in Task 5)
- Modify: `src/components/floating-cta/FloatingCta.tsx`
- Modify: `src/app/globals.css` (add `.cta-ripple` paint utility)

**Step 1: Add the ripple paint to globals.css**

Append to `src/app/globals.css`:

```css
.cta-ripple {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  pointer-events: none;
  overflow: hidden;
}

.cta-ripple::before {
  content: "";
  position: absolute;
  left: var(--ripple-x, 50%);
  top: var(--ripple-y, 50%);
  width: var(--ripple-radius, 0px);
  height: var(--ripple-radius, 0px);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(168, 85, 247, 0.35) 0%,
    rgba(249, 115, 22, 0.20) 30%,
    transparent 70%
  );
  opacity: var(--ripple-opacity, 0);
  will-change: width, height, opacity;
}
```

The pill root needs `overflow: hidden` for the ripple to be clipped. Add `overflow-hidden` to the root's classes in `FloatingCta.tsx`.

**Step 2: Implement the ripple hook**

Create `src/components/floating-cta/useMagneticPointer.ts`:

```ts
"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Args = {
  pillRef: RefObject<HTMLElement | null>;
  rippleRef: RefObject<HTMLElement | null>;
  reducedMotion: boolean;
};

export function useMagneticPointer({ pillRef, rippleRef, reducedMotion }: Args) {
  useEffect(() => {
    if (reducedMotion) return;
    const pill = pillRef.current;
    const ripple = rippleRef.current;
    if (!pill || !ripple) return;

    const fireRipple = (
      x: number,
      y: number,
      opts: { peakOpacity: number; peakRadiusPct: number; duration: number },
    ) => {
      const rect = pill.getBoundingClientRect();
      const peakRadius = rect.width * opts.peakRadiusPct;
      gsap.set(ripple, {
        "--ripple-x": `${x}px`,
        "--ripple-y": `${y}px`,
        "--ripple-radius": "0px",
        "--ripple-opacity": opts.peakOpacity,
      });
      gsap.to(ripple, {
        "--ripple-radius": `${peakRadius}px`,
        "--ripple-opacity": 0,
        duration: opts.duration,
        ease: "power2.out",
      });
    };

    const onEnter = (e: PointerEvent) => {
      const rect = pill.getBoundingClientRect();
      fireRipple(e.clientX - rect.left, e.clientY - rect.top, {
        peakOpacity: 0.9,
        peakRadiusPct: 1.4,
        duration: 0.7,
      });
    };

    const onLeave = (e: PointerEvent) => {
      const rect = pill.getBoundingClientRect();
      fireRipple(e.clientX - rect.left, e.clientY - rect.top, {
        peakOpacity: 0.45,
        peakRadiusPct: 0.7,
        duration: 0.4,
      });
    };

    pill.addEventListener("pointerenter", onEnter);
    pill.addEventListener("pointerleave", onLeave);
    return () => {
      pill.removeEventListener("pointerenter", onEnter);
      pill.removeEventListener("pointerleave", onLeave);
    };
  }, [pillRef, rippleRef, reducedMotion]);
}
```

**Step 3: Wire into `FloatingCta.tsx`**

- Add a `rippleRef` ref.
- Add the ripple element as the first child inside the pill root (before the border):

```tsx
<span ref={rippleRef} aria-hidden="true" className="cta-ripple" />
```

- Add `overflow-hidden` to the root's className list.
- Call the hook: `useMagneticPointer({ pillRef: rootRef, rippleRef, reducedMotion });`

**Step 4: Smoke test**

- Move pointer into the pill from different sides. Confirm ripple emanates from the exact entry point and resolves cleanly.
- Move pointer out from different sides. Confirm exit ripple is smaller, faster, and fires from the exit point.
- Reduced motion: no ripple.

**Step 5: Commit**

```bash
git add src/components/floating-cta/ src/app/globals.css
git commit -m "feat(cta): pointer-driven iridescent ripple"
```

---

## Task 5: Magnetic button pull + arrow lean

Goal: While pointer is inside the pill, the button translates toward the cursor (max ±4px x, ±2px y) via rAF lerp. The arrow glyph independently leans +2px right while the pointer is inside the pill. On leave, both lerp back to 0 (no snap). No GSAP — imperative rAF.

**Files:**
- Modify: `src/components/floating-cta/useMagneticPointer.ts`
- Modify: `src/components/floating-cta/FloatingCta.tsx` (add `buttonRef`, `arrowRef`)

**Step 1: Extend the hook**

Add to `useMagneticPointer.ts` args:

```ts
type Args = {
  pillRef: RefObject<HTMLElement | null>;
  rippleRef: RefObject<HTMLElement | null>;
  buttonRef: RefObject<HTMLElement | null>;
  arrowRef: RefObject<HTMLElement | null>;
  reducedMotion: boolean;
};
```

Inside the `useEffect`, after the ripple wiring, add:

```ts
const button = buttonRef.current;
const arrow = arrowRef.current;
if (!button || !arrow) return;

let target = { x: 0, y: 0 };
let current = { x: 0, y: 0 };
let arrowTarget = 0;
let arrowCurrent = 0;
let inside = false;
let rafId = 0;

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const onMove = (e: PointerEvent) => {
  const rect = button.getBoundingClientRect();
  const bx = rect.left + rect.width / 2;
  const by = rect.top + rect.height / 2;
  target.x = clamp((e.clientX - bx) * 0.08, -4, 4);
  target.y = clamp((e.clientY - by) * 0.08, -2, 2);
};

const pillEnter = () => {
  inside = true;
  arrowTarget = 2;
};
const pillLeave = () => {
  inside = false;
  target.x = 0;
  target.y = 0;
  arrowTarget = 0;
};

const loop = () => {
  current.x += (target.x - current.x) * 0.18;
  current.y += (target.y - current.y) * 0.18;
  arrowCurrent += (arrowTarget - arrowCurrent) * 0.18;
  button.style.transform = `translate(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px)`;
  arrow.style.transform = `translateX(${arrowCurrent.toFixed(2)}px)`;
  rafId = requestAnimationFrame(loop);
};
rafId = requestAnimationFrame(loop);

pill.addEventListener("pointerenter", pillEnter);
pill.addEventListener("pointerleave", pillLeave);
pill.addEventListener("pointermove", onMove);
```

Update the cleanup return to also cancel rAF and remove the new listeners:

```ts
return () => {
  pill.removeEventListener("pointerenter", onEnter);
  pill.removeEventListener("pointerleave", onLeave);
  pill.removeEventListener("pointerenter", pillEnter);
  pill.removeEventListener("pointerleave", pillLeave);
  pill.removeEventListener("pointermove", onMove);
  cancelAnimationFrame(rafId);
  button.style.transform = "";
  arrow.style.transform = "";
};
```

**Step 2: Add refs in `FloatingCta.tsx`**

```tsx
const buttonRef = useRef<HTMLAnchorElement | null>(null);
const arrowRef = useRef<HTMLSpanElement | null>(null);
```

Attach `ref={buttonRef}` to the `<a>`, `ref={arrowRef}` to the arrow `<span data-cta-arrow>`.

Update the hook call:

```tsx
useMagneticPointer({
  pillRef: rootRef,
  rippleRef,
  buttonRef,
  arrowRef,
  reducedMotion,
});
```

**Step 3: Smoke test**

- Glide pointer across the pill. The button should drift toward the cursor smoothly (clamped to ±4px / ±2px). Arrow drifts right.
- Leave the pill. Both decay smoothly to zero, no snap.
- Reduced motion: no movement.

**Step 4: Commit**

```bash
git add src/components/floating-cta/
git commit -m "feat(cta): magnetic button pull + arrow lean"
```

---

## Task 6: Surface response (border + saturate + button scale)

Goal: While pointer is inside the pill, border opacity ramps 0.35 → 0.85 (250ms) and backdrop saturate ramps 140% → 180%. While pointer is inside the *button* (not just the pill), button micro-scales 1.00 → 1.04 (200ms).

**Files:**
- Modify: `src/components/floating-cta/useMagneticPointer.ts`
- Modify: `src/components/floating-cta/FloatingCta.tsx` (add `borderRef` to args)

**Step 1: Pass border + add surface tween**

Update the hook args to include `borderRef: RefObject<HTMLElement | null>`. Pass it from `FloatingCta`.

In the effect, after listeners are bound, replace the simple `pillEnter` / `pillLeave` with versions that also drive border + saturate:

```ts
const pillEnter = () => {
  inside = true;
  arrowTarget = 2;
  if (borderRef.current) {
    gsap.to(borderRef.current, { opacity: 0.85, duration: 0.25, ease: "power2.out", overwrite: "auto" });
  }
  gsap.to(pill, { "--cta-saturate": "180%", duration: 0.25, ease: "power2.out", overwrite: "auto" });
};
const pillLeave = () => {
  inside = false;
  target.x = 0;
  target.y = 0;
  arrowTarget = 0;
  if (borderRef.current) {
    gsap.to(borderRef.current, { opacity: 0.35, duration: 0.25, ease: "power2.out", overwrite: "auto" });
  }
  gsap.to(pill, { "--cta-saturate": "140%", duration: 0.25, ease: "power2.out", overwrite: "auto" });
};
```

**Important:** The idle pulse from Task 2 also animates `borderRef` opacity. To avoid the pulse fighting the hover ramp, **pause the pulse on enter, resume on leave**. Easiest way: store the pulse tween in a ref (lift Task 2's `tween` out into a `useRef`), then call `.pause()` / `.resume()` in `pillEnter` / `pillLeave`.

Refactor Task 2 — in `FloatingCta.tsx`:

```tsx
const pulseTweenRef = useRef<gsap.core.Tween | null>(null);

useGSAP(
  () => {
    if (reducedMotion) return;
    const border = borderRef.current;
    if (!border) return;
    pulseTweenRef.current = gsap.to(border, {
      opacity: 0.45,
      duration: 2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => { pulseTweenRef.current?.kill(); };
  },
  { scope: rootRef, dependencies: [reducedMotion] },
);
```

Pass `pulseTweenRef` into `useMagneticPointer` and have `pillEnter` call `pulseTweenRef.current?.pause()`, `pillLeave` call `.resume()` (after the 0.25s opacity tween completes — use the tween's `onComplete` to resume to keep visuals clean).

**Step 2: Drive `--cta-saturate` from CSS**

Replace the inline `WebkitBackdropFilter` style in `FloatingCta.tsx` with a CSS-variable-driven version. Either inline:

```tsx
style={{
  // @ts-expect-error custom property
  "--cta-saturate": "140%",
  WebkitBackdropFilter: "blur(20px) saturate(var(--cta-saturate))",
  backdropFilter: "blur(20px) saturate(var(--cta-saturate))",
}}
```

Remove the Tailwind `backdrop-saturate-[1.4]` class (it would override).

**Step 3: Button-only scale**

Add separate listeners for the button:

```ts
const buttonEnter = () => {
  gsap.to(button, { scale: 1.04, duration: 0.2, ease: "power2.out", overwrite: "auto" });
};
const buttonLeave = () => {
  gsap.to(button, { scale: 1.0, duration: 0.2, ease: "power2.out", overwrite: "auto" });
};
button.addEventListener("pointerenter", buttonEnter);
button.addEventListener("pointerleave", buttonLeave);
```

**Caveat:** The magnetic rAF loop sets `button.style.transform = translate(...)`. GSAP's `scale` will set it too. To avoid them stomping each other, drive translate via a CSS variable (`--btn-x`, `--btn-y`) and let GSAP own `scale`:

```ts
button.style.transform = `translate(var(--btn-x, 0), var(--btn-y, 0))`;
// in loop:
button.style.setProperty("--btn-x", `${current.x.toFixed(2)}px`);
button.style.setProperty("--btn-y", `${current.y.toFixed(2)}px`);
```

Then GSAP's `scale` composes correctly because GSAP authors a separate matrix property. Verify in DevTools.

Add the corresponding listeners to cleanup.

**Step 4: Smoke test**

- Enter pill from outside — border lights up, saturate intensifies.
- Move pointer onto the white button specifically — button micro-scales 1.04.
- Move pointer back off the button but still inside the pill — scale relaxes, surface stays "on".
- Leave the pill — border decays back to 0.35, saturate returns to 140%, idle pulse resumes.

**Step 5: Commit**

```bash
git add src/components/floating-cta/
git commit -m "feat(cta): surface response on hover (border, saturate, button scale)"
```

---

## Task 7: Mobile adaptations

Goal: At ≤768px the pill drops to 40px height, 16px from top, no magnetic pull, tap fires a single ripple from the tap point and a `:active` scale on the button. Tap target on the button stays ≥44px tall via padding/hit-area.

**Files:**
- Modify: `src/components/floating-cta/FloatingCta.tsx`
- Modify: `src/components/floating-cta/useMagneticPointer.ts`

**Step 1: Responsive class swap**

In `FloatingCta.tsx`, change root classes so:
- Height: `h-10 md:h-12`
- Top offset: `top-4 md:top-5` (plus `pt-[env(safe-area-inset-top)]` if needed)
- Padding: `pl-3 pr-1 md:pl-4 md:pr-1.5`
- Label font weight + size unchanged but consider `text-[13px] md:text-[14px]` if label truncates at 340px.

Button: ensure padding gives ≥44px effective height — `py-3 md:py-[9px] -my-1 md:my-0` (negative margin extends the hit area without affecting visual height).

**Step 2: Detect coarse pointer and short-circuit magnetic logic**

In `useMagneticPointer.ts`, at the top of the effect:

```ts
const isCoarse = window.matchMedia("(pointer: coarse)").matches;
```

If `isCoarse`:
- Skip the rAF loop entirely.
- Skip `pointermove`-driven magnetic offset and surface ramps.
- Keep the ripple but bind it to `pointerdown` instead of `pointerenter`:

```ts
if (isCoarse) {
  const onTap = (e: PointerEvent) => {
    const rect = pill.getBoundingClientRect();
    fireRipple(e.clientX - rect.left, e.clientY - rect.top, {
      peakOpacity: 0.9,
      peakRadiusPct: 1.4,
      duration: 0.7,
    });
  };
  pill.addEventListener("pointerdown", onTap);
  return () => { pill.removeEventListener("pointerdown", onTap); };
}
```

Place this **before** the desktop hover wiring so it's a clean short-circuit.

**Step 3: `:active` scale on the button**

In `FloatingCta.tsx`, on the `<a>`, add `active:scale-[1.04] transition-transform duration-150`. Tailwind v4 supports `active:` modifier; verify if not, fall back to a plain class with `:active` in globals.

**Step 4: Smoke test (mobile)**

Resize devtools to 375×667. Confirm:
- Pill is 40px tall, 16px from top, centred.
- Label fits — if it doesn't, change copy to `Materials¹` only (see design doc §4).
- Tap target on the button is ≥44px vertically (use the inspector's accessibility overlay).
- Tap on the pill fires a single ripple from the tap point.
- Tap on the button scales 1.04 briefly.
- No magnetic drift.

**Step 5: Commit**

```bash
git add src/components/floating-cta/
git commit -m "feat(cta): mobile adaptations — no hover, tap ripple, safe tap target"
```

---

## Task 8: Focus state + keyboard activation

Goal: Tabbing to the button shows a 2px iridescent focus ring at 80% opacity. Activating via space/enter fires the exit ripple (treated as a gesture confirmation).

**Files:**
- Modify: `src/components/floating-cta/FloatingCta.tsx`
- Modify: `src/components/floating-cta/useMagneticPointer.ts`
- Modify: `src/app/globals.css` (focus ring utility)

**Step 1: Focus ring**

Add to `globals.css`:

```css
.cta-focus-ring:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px rgba(0, 0, 0, 0.95),
    0 0 0 4px rgba(168, 85, 247, 0.8);
}
```

(2px dark backstop to keep the iridescent ring readable against the white button.) Add `cta-focus-ring` to the `<a>`'s classes.

For a truer gradient ring, an SVG outline is heavier than it's worth — the dual box-shadow approximates iridescence well enough on a 2px outline. Lock if visual-reviewer flags.

**Step 2: Surface response on focus**

In `useMagneticPointer.ts`, add `focus` / `blur` listeners on `button` that mirror `pillEnter` / `pillLeave` but **skip the magnetic and arrow updates** (keyboard users have no pointer position to follow):

```ts
const onFocus = () => {
  if (borderRef.current) gsap.to(borderRef.current, { opacity: 0.85, duration: 0.25, overwrite: "auto" });
  gsap.to(pill, { "--cta-saturate": "180%", duration: 0.25, overwrite: "auto" });
  pulseTweenRef.current?.pause();
};
const onBlur = () => {
  if (borderRef.current) gsap.to(borderRef.current, { opacity: 0.35, duration: 0.25, overwrite: "auto", onComplete: () => pulseTweenRef.current?.resume() });
  gsap.to(pill, { "--cta-saturate": "140%", duration: 0.25, overwrite: "auto" });
};
button.addEventListener("focus", onFocus);
button.addEventListener("blur", onBlur);
```

**Step 3: Keyboard-activation ripple**

```ts
const onKeyActivate = (e: KeyboardEvent) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const rect = button.getBoundingClientRect();
  const pillRect = pill.getBoundingClientRect();
  fireRipple(
    rect.left + rect.width / 2 - pillRect.left,
    rect.top + rect.height / 2 - pillRect.top,
    { peakOpacity: 0.45, peakRadiusPct: 0.7, duration: 0.4 },
  );
};
button.addEventListener("keydown", onKeyActivate);
```

Add all three listeners to cleanup.

**Step 4: Smoke test**

- Press Tab repeatedly until the Buy link is focused. Confirm the 2px iridescent ring appears and surface lights up (no magnetic drift).
- Press Enter — confirm the exit ripple fires from the button centre.
- Tab away — surface decays, pulse resumes.

**Step 5: Commit**

```bash
git add src/components/floating-cta/ src/app/globals.css
git commit -m "feat(cta): focus ring + keyboard-activated ripple"
```

---

## Task 9: Visual review loop

Goal: PASS at both viewports per project verification protocol (CLAUDE.md §Verification protocol).

**Step 1: Manual smoke**

Walk through every behaviour at both 1440 and 375. Use the design doc as a checklist:
- Composition (label + divider + button)
- Surface (cool dark glass, no warm bleed)
- Idle pulse breathing 4s
- Scroll reveal/hide
- Entry ripple + exit ripple
- Magnetic button pull + arrow lean
- Surface response (border, saturate, button scale)
- Mobile tap ripple
- Focus ring
- Reduced motion across all of the above

Watch the browser console — no errors, no warnings.

**Step 2: Delegate to visual-reviewer**

```text
Use the visual-reviewer subagent. Tell it:
- Project is desktop-led; review desktop (1440×900) FIRST.
- Feature: floating CTA pill at top-centre of the page, revealed after hero.
- Source of truth: docs/plans/2026-05-12-floating-cta-design.md.
- Check both at-rest and hover states (hover the pill, hover the button, leave the pill).
- Then review mobile (375×667).
```

**Step 3: Loop**

Address every finding. Re-run the reviewer. Repeat until PASS at both viewports. No "done" without it.

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix(cta): address visual review notes"
```

---

## Notes for the implementer

- **Don't add `data-reveal` to the pill root.** The global `[data-reveal] { opacity: 0 }` rule will fight the scroll-reveal `gsap.set`. Use `data-cta-root` for marking and let GSAP own initial state.
- **Don't import GSAP directly.** Always use `@/lib/gsap` so plugin registration runs once.
- **Don't add `useEffect` for what `useGSAP` can do.** `useGSAP` auto-cleans tweens scoped to the ref. The `useMagneticPointer` hook is a `useEffect` because it manages raw rAF + DOM listeners that GSAP isn't authoring.
- **Don't mix Tailwind `backdrop-saturate-*` with the JS-driven `--cta-saturate`.** Pick one source. The plan picks the variable.
- **Pulse vs. hover conflict.** Both touch `border` opacity. Pause/resume the pulse on hover; don't try to `add` them — they'll desync.
- **Two hero sections.** `[data-hero-section]` matches twice (desktop + mobile per `Hero.tsx`). Verify the chosen anchor produces the right trigger position at both breakpoints; pick the visible one if needed.
- **Banned words check.** Copy is locked (`Materials¹ — Edition 1`, `Buy →`). No marketing verbs creep in.
- **Two motion moments rule.** Design doc §8 classifies the CTA's hover as ambient micro-motion, not a third moment. Don't introduce additional ambient animations elsewhere as a side-effect.

---

## File-touch summary

- **Created:**
  - `src/components/floating-cta/FloatingCta.tsx`
  - `src/components/floating-cta/FloatingCta.test.tsx`
  - `src/components/floating-cta/useScrollReveal.ts`
  - `src/components/floating-cta/useMagneticPointer.ts`
- **Modified:**
  - `src/app/page.tsx` — mount `FloatingCta` outside `<main>`
  - `src/app/globals.css` — `.cta-pill-border`, `.cta-ripple`, `.cta-focus-ring`
