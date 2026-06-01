# Demo-caption Overlay (§05) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a scroll-driven caption ("APPLIED" / "A few Materials, on real work.") that reveals over the §05 Macbook demo poster during its approach, then rises + shrinks out of view as the video pins and scrubs.

**Architecture:** Caption markup lives *inside* the existing `MacbookDemo` block so it pins with the video. Two scroll beats drive it, both created inside the **same `deferGsap` block** in `useMacbookScrub`: Beat 1 is a standalone scrub trigger (`top bottom` → `top top`) that reveals words hero-style; Beat 2 is folded into the existing pin timeline (first ~25%) and animates the whole caption up + out. Reduced-motion renders a static eyebrow+line top-left (no triggers). No new files, no new tokens.

**Tech Stack:** React 19 · GSAP 3 (`gsap.timeline` + `ScrollTrigger`, via `@/lib/gsap`) · `deferGsap` (`@/lib/scrollTrigger`) · Tailwind v4 · vitest + Testing Library.

**Source design:** `docs/plans/2026-05-29-demo-caption-overlay-design.md` (decisions locked). Read it before starting.

---

## Key facts the engineer must know before writing code

- **The `data-reveal` opacity trap.** A global CSS rule `[data-reveal]{opacity:0}` permanently hides anything carrying that attribute. **Do NOT** put `data-reveal` on the caption. Use the plain `data-demo-caption-*` hooks below and set the initial hidden state via `gsap.set()` inside the timeline — exactly like `HeroHeadline` / `useHeroTimeline` (`src/components/hero/useHeroTimeline.ts:81`).
- **The hero word-reveal feel to match 1:1** (`useHeroTimeline.ts:81-95`):
  - hidden state: `gsap.set(words, { opacity: 0, y: 14, filter: "blur(10px)" })`
  - reveal: `{ opacity: 1, y: 0, filter: "blur(0px)", ease: "power2.out", stagger: { each: ..., from: "start" } }`
  - Match the *property values + ease + per-word stagger* exactly. Absolute `duration`/`each` numbers scale to the approach distance (Beat 1 spans ~1 viewport height, not a 3000px pinned scrub), so they differ from the hero's literals — that is expected.
- **`deferGsap` drains one setup per rAF, early.** The queue empties within a few frames of page load, long before the deep-in-page §05 block scrolls into view. So `gsap.set(...)` hiding the words runs well before the caption can be seen — no visible flash in practice (same tradeoff the hero already accepts). Do not add a CSS pre-hide.
- **Two triggers on one pinned element is the riskiest part.** Beat 1's range (`top bottom` → `top top`) sits entirely *above* the pin start (`top top`), so the pin-spacer should not shift it — but this MUST be confirmed in-browser (Task 5).
- **Existing pin timeline** lives in `useMacbookScrub.ts:47-82`: a `gsap.timeline({ scrollTrigger: { trigger: block, start: "top top", end: "+=scrubPx", scrub: 0.3, pin: true, ... } })` whose only tween is `tl.to(video, { currentTime, duration: 1 }, ...)`. Beat 2 is a second tween added to *this* `tl`.
- **Reduced motion already bails:** `MacbookDemo` passes `enabled: !reduced` and `useMacbookScrub` early-returns when `!enabled`. So in reduced mode no trigger touches the caption — it must render fully visible and statically positioned on its own.
- **§05 headline type family** (`SectionCloseDesktop.tsx:17`): `font-display text-[56px] font-semibold leading-[1.15] tracking-[-0.0334em]`. The caption display line uses the same weight/leading/tracking family at a smaller overlay size (tune in review).
- **Eyebrow convention** (caps metadata, e.g. `SectionRecipeDesktop.tsx:184`, `CloseTestimonial.tsx:55`): `font-display font-medium uppercase tracking-[0.22em–0.28em] text-white/...`. Over the dark poster use a legible tint (`text-white/70`).

---

## Task 1: Caption markup + reduced/motion variants in `MacbookDemo`

**Files:**
- Modify: `src/components/section-05/MacbookDemo.tsx`
- Test: `src/components/section-05/MacbookDemo.test.tsx` (create)

**Step 1: Write the failing test**

Create `src/components/section-05/MacbookDemo.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// Default the reduced-motion hook to false; individual tests override.
const reducedMock = vi.fn(() => false);
vi.mock("../hero/useReducedMotion", () => ({
  useReducedMotion: () => reducedMock(),
}));
// Stub the scrub hook — Task 1 is markup only; motion is browser-verified.
vi.mock("./useMacbookScrub", () => ({ useMacbookScrub: () => {} }));

import { MacbookDemo } from "./MacbookDemo";

describe("MacbookDemo caption", () => {
  it("renders the eyebrow and each display word as its own span", () => {
    reducedMock.mockReturnValue(false);
    const { container } = render(<MacbookDemo variant="desktop" />);
    const caption = container.querySelector("[data-demo-caption]");
    expect(caption).not.toBeNull();
    expect(
      container.querySelector("[data-demo-caption-eyebrow]")?.textContent,
    ).toBe("APPLIED");
    const words = container.querySelectorAll("[data-demo-caption-word]");
    expect([...words].map((w) => w.textContent)).toEqual([
      "A",
      "few",
      "Materials,",
      "on",
      "real",
      "work.",
    ]);
  });

  it("never marks the caption with data-reveal (would be hidden by global CSS)", () => {
    reducedMock.mockReturnValue(false);
    const { container } = render(<MacbookDemo variant="desktop" />);
    const caption = container.querySelector("[data-demo-caption]");
    expect(caption?.querySelector("[data-reveal]")).toBeNull();
    expect(caption?.hasAttribute("data-reveal")).toBe(false);
  });

  it("flags motion vs static layout via the data-demo-caption value", () => {
    reducedMock.mockReturnValue(false);
    const motion = render(<MacbookDemo variant="desktop" />);
    expect(
      motion.container
        .querySelector("[data-demo-caption]")
        ?.getAttribute("data-demo-caption"),
    ).toBe("motion");

    reducedMock.mockReturnValue(true);
    const stat = render(<MacbookDemo variant="desktop" />);
    expect(
      stat.container
        .querySelector("[data-demo-caption]")
        ?.getAttribute("data-demo-caption"),
    ).toBe("static");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/section-05/MacbookDemo.test.tsx`
Expected: FAIL — `[data-demo-caption]` not found (caption not yet added).

**Step 3: Add the caption markup**

In `MacbookDemo.tsx`, inside the `relative aspect-[2/1]` container (`MacbookDemo.tsx:56`), **between** the `<video>` (closes line 70) and the play-button overlay `<div>` (opens line 72). DOM order matters: caption first, play-overlay after, so the play overlay (when shown) stacks above the caption.

Define the words once near the top of the component body:

```tsx
const CAPTION_WORDS = ["A", "few", "Materials,", "on", "real", "work."];
```

Insert the markup:

```tsx
<div
  data-demo-caption={reduced ? "static" : "motion"}
  aria-hidden={!reduced || undefined}
  className={
    reduced
      ? "pointer-events-none absolute left-6 top-6 z-10 flex flex-col gap-2 text-left"
      : "pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center"
  }
>
  <span
    data-demo-caption-eyebrow
    className="font-display text-[11px] font-medium uppercase tracking-[0.28em] text-white/70"
  >
    APPLIED
  </span>
  <p
    data-demo-caption-line
    className="font-display text-3xl font-semibold leading-[1.15] tracking-[-0.0334em] text-white md:text-[40px]"
  >
    {CAPTION_WORDS.map((word, i) => (
      <span key={i} data-demo-caption-word className="mr-[0.25em] inline-block">
        {word}
      </span>
    ))}
  </p>
</div>
```

Notes:
- `pointer-events-none` so the caption never blocks the play button beneath/around it.
- `aria-hidden` only in motion mode (decorative animated layer); in reduced mode it is the real readable label, so leave it exposed. (`undefined` removes the attribute rather than setting `aria-hidden="false"`.)
- `z-10` keeps it above the video; the play overlay (later in DOM, also `absolute`) wins when visible.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/section-05/MacbookDemo.test.tsx`
Expected: PASS (all three tests).

**Step 5: Commit**

```bash
git add src/components/section-05/MacbookDemo.tsx src/components/section-05/MacbookDemo.test.tsx
git commit -m "feat(section-05): add demo caption markup (motion + static variants)"
```

---

## Task 2: Beat 1 — reveal-on-approach trigger in `useMacbookScrub`

**Files:**
- Modify: `src/components/section-05/useMacbookScrub.ts` (inside `setup()`, `useMacbookScrub.ts:34-83`)

No new unit test — GSAP scroll behaviour is verified in-browser (Task 5). The existing `MacbookDemo.test.tsx` stubs this hook, so it must keep its current signature.

**Step 1: Query the caption elements**

At the top of `setup()` (after the `isDesktop`/`scrubPx` lines, `useMacbookScrub.ts:35`), add:

```ts
const caption = block.querySelector<HTMLElement>("[data-demo-caption]");
const eyebrow = caption?.querySelector<HTMLElement>(
  "[data-demo-caption-eyebrow]",
);
const words = caption?.querySelectorAll<HTMLElement>(
  "[data-demo-caption-word]",
);
```

**Step 2: Add the Beat 1 reveal trigger**

Still inside `setup()`, *before* the existing pin timeline (`const tl = ...`, `useMacbookScrub.ts:47`), so it is created first in the same `deferGsap` block:

```ts
if (caption && words && words.length) {
  // Hidden initial state — set here, NOT via data-reveal (global CSS trap).
  // Matches the hero word-reveal 1:1.
  gsap.set([eyebrow, ...words], {
    opacity: 0,
    y: 14,
    filter: "blur(10px)",
  });

  const revealTl = gsap.timeline({
    scrollTrigger: {
      trigger: block,
      start: "top bottom", // block enters from viewport bottom
      end: "top top", // ...up to the pin point
      scrub: 0.3,
    },
  });

  revealTl
    .to(
      eyebrow,
      { opacity: 1, y: 0, filter: "blur(0px)", ease: "power2.out", duration: 0.3 },
      0,
    )
    .to(
      [...words],
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        ease: "power2.out",
        duration: 0.3,
        stagger: { each: 0.06, from: "start" },
      },
      0.15,
    );
}
```

Rationale: same `opacity/y/blur` set + `power2.out` + per-word `from:"start"` stagger as the hero. Durations/stagger scaled to the approach length (tune in Task 5 if pace feels off).

**Step 3: Build-only sanity check**

Run: `pnpm vitest run src/components/section-05/MacbookDemo.test.tsx`
Expected: PASS (hook is stubbed in tests; this confirms nothing else broke).

Run: `pnpm build`
Expected: compiles, no TS errors.

**Step 4: Commit**

```bash
git add src/components/section-05/useMacbookScrub.ts
git commit -m "feat(section-05): reveal demo caption on approach (beat 1)"
```

---

## Task 3: Beat 2 — rise & shrink, folded into the pin timeline

**Files:**
- Modify: `src/components/section-05/useMacbookScrub.ts` (the existing `tl`, `useMacbookScrub.ts:77-82`)

**Step 1: Add the caption-exit tween to the existing pin timeline**

Immediately after the existing `tl.to(video, { currentTime: scrubDuration, ... })` block (`useMacbookScrub.ts:82`), add:

```ts
if (caption) {
  // Rise + shrink + fade over the first ~25% of the pinned scrub.
  // immediateRender: false → capture the live (Beat-1-revealed) state when
  // scrubbed into, NOT the hidden build-time state.
  tl.to(
    caption,
    {
      y: -60,
      scale: 0.82,
      opacity: 0,
      ease: "power2.in",
      duration: 0.25,
      immediateRender: false,
    },
    0,
  );
}
```

Why `immediateRender: false` matters: at build time the caption children are still `opacity:0` (Beat 1's `gsap.set`). Without this flag GSAP could record that hidden state as the tween's start. By the time the pin engages, Beat 1 has run to completion (its `end` is the pin `start`), so the caption is fully visible — and Beat 2 should fade from *that* state. The flag defers start-value capture to first render.

Position `0`, `duration: 0.25` = first quarter of the pinned scrub. Scrub-driven ⇒ scrolling back up reverses it (caption grows back down). The container animates while the video scrub (also at position 0, duration 1) runs underneath.

**Step 2: Build-only sanity check**

Run: `pnpm build`
Expected: compiles, no TS errors.

**Step 3: Commit**

```bash
git add src/components/section-05/useMacbookScrub.ts
git commit -m "feat(section-05): rise & shrink demo caption on pin (beat 2)"
```

---

## Task 4: Full check suite (lint + tests + build)

**Step 1: Run the gate the project requires before review**

Run: `pnpm lint && pnpm vitest run && pnpm build`
Expected: lint clean, all tests pass, build succeeds.

Fix anything that fails before moving on. No commit unless a fix was needed (then `fix:` or `chore:`).

---

## Task 5: In-browser smoke test, then visual-reviewer loop

This is the real verification gate for the motion — unit tests cannot cover scroll-scrubbed GSAP.

**Step 1: Smoke-test manually first** (per project memory: smoke-test before delegating to visual-reviewer)

- `pnpm dev` → http://localhost:3000
- Scroll slowly down into §05. Confirm, in order:
  1. **Approach:** eyebrow + words resolve in (fade / rise / de-blur, staggered) as the block climbs from viewport-bottom toward the top. Reversing the scroll grows them back down.
  2. **Reveal complete:** at the moment the block tops out (pin point), the caption is fully visible and legible over the poster.
  3. **Pin / scrub:** as the video pins and scrubs, the caption rises + shrinks + fades out within the first chunk of the scrub. Scrolling back up brings it back.
  4. The play-button overlay (centered) does **not** collide with or get blocked by the caption (caption is `pointer-events-none`).
- **Console:** no errors/warnings. Specifically watch for the `deferGsap` "Cannot read properties of undefined (reading 'end')" race and any pin-spacer jump that shifts Beat 1's range (the two-triggers-on-one-pinned-element risk). If Beat 1 drifts, that is the gotcha from the design doc — flag it.
- **Reduced motion:** in DevTools, emulate `prefers-reduced-motion: reduce`, reload. The caption must render static, top-left, full opacity, no motion, not centered (so it never overlaps the centered play overlay).

**Step 2: Delegate to `visual-reviewer`** (desktop FIRST per the DESKTOP-LED rule)

Per the design doc's Playwright caveats:
- This is scrubbed motion — the reviewer must settle the scroll at precise offsets and let it stabilise before each screenshot. Capture three deliberate states: (a) approach mid-reveal, (b) fully revealed at the pin point, (c) pinned with caption exited.
- **Confirm the Playwright MCP browser is actually available first.** If it's tied up by another session: `browser_close` or restart the MCP server and retry once. If still blocked, **skip the automated review** rather than stall — rely on the Step 1 manual smoke test and explicitly flag to the user that automated review was skipped because Playwright was unavailable.

**Step 3: Loop until PASS at 1440 (desktop) and 375 (mobile).** Apply reviewer fixes (likely caption font-size, stagger pace, or Beat 2 distance), re-run Task 4's suite after any code change, re-review. A desktop FAIL is the priority.

**Step 4: Final commit (only if review prompted changes)**

```bash
git add -A
git commit -m "fix(section-05): demo caption polish from visual review"
```

---

## Done criteria

- `pnpm lint && pnpm vitest run && pnpm build` all green.
- Manual smoke test: all four approach/pin behaviours correct, no console errors, reduced-motion static variant correct.
- `visual-reviewer` reports PASS at 1440 and 375 (or automated review explicitly skipped + flagged because Playwright was unavailable, with manual smoke test standing in).
- No `data-reveal` on the caption; no new files; no palette/token additions; §05's one-per-section gradient-word allowance untouched (caption is plain white).
