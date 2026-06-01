# §05 Demo-caption motion v2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rework the §05 demo caption so it reveals big + centred over the video as the block hits viewport centre, then rises + shrinks once (forward-only) to rest above the video, never overlapping the laptop screen or re-fading on scroll.

**Architecture:** Caption moves OUT of the video's `overflow-hidden` frame to an in-flow sibling above the video inside `data-macbook-demo` — its natural layout position is its rest spot. The big reveal is a pure `transform` (scale up + translateY down, computed from measured video height) so the video never shifts. Beat 1 (word de-blur) is scrubbed; Beat 2 (container rise/shrink) fires once, forward-only. Mobile gets the reveal only, no rise.

**Tech Stack:** React 19, GSAP 3 (`ScrollTrigger`, `deferGsap`), Tailwind v4, vitest.

**Design doc:** `docs/plans/2026-05-29-demo-caption-overlay-design-v2.md`

**Constraints (binding):** never put `data-reveal` on the caption (global `[data-reveal]{opacity:0}` trap — hidden states via `gsap.set` only); every ScrollTrigger/timeline inside the existing `deferGsap` block; plain white, no gradient word; reduced-motion fallback required; desktop-led (verify 1440 first).

---

### Task 1: Restructure caption markup (out of the video frame, rest sizing)

**Files:**
- Modify: `src/components/section-05/MacbookDemo.tsx`
- Test: `src/components/section-05/MacbookDemo.test.tsx`

**Step 1: Add a failing test that the caption is a sibling ABOVE the video frame (not inside the overflow-hidden frame).**

Add to `MacbookDemo.test.tsx`:

```tsx
it("renders the caption as a sibling above the video frame, not inside it", () => {
  reducedMock.mockReturnValue(false);
  const { container } = render(<MacbookDemo variant="desktop" />);
  const block = container.querySelector("[data-macbook-demo]");
  const caption = container.querySelector("[data-demo-caption]");
  const frame = block?.querySelector("video")?.closest(".overflow-hidden");
  expect(caption).not.toBeNull();
  expect(frame).not.toBeNull();
  // caption must NOT be nested inside the video frame
  expect(frame?.contains(caption!)).toBe(false);
  // caption must be a direct child of the block, before the video frame
  expect(caption?.parentElement).toBe(block);
  const kids = [...(block?.children ?? [])];
  expect(kids.indexOf(caption!)).toBeLessThan(kids.indexOf(frame!));
});
```

**Step 2: Run it, expect FAIL.**

Run: `pnpm vitest run src/components/section-05/MacbookDemo.test.tsx`
Expected: FAIL (caption is currently inside the frame).

**Step 3: Restructure the JSX.** Move `[data-demo-caption]` to be the first child of the `data-macbook-demo` block, before the `aspect-[2/1] overflow-hidden` video frame. New structure:

```tsx
return (
  <div ref={blockRef} className="relative w-full bg-hero-bg" data-macbook-demo>
    <div
      data-demo-caption={reduced ? "static" : "motion"}
      aria-hidden={!reduced || undefined}
      className={
        reduced
          ? "pointer-events-none px-6 py-4 text-center"
          : "pointer-events-none relative z-10 px-6 py-4 text-center will-change-transform"
      }
      style={reduced ? undefined : { transformOrigin: "top center" }}
    >
      <span
        data-demo-caption-eyebrow
        className="font-display text-[11px] font-medium uppercase tracking-[0.28em] text-white/70"
      >
        APPLIED
      </span>
      <p
        data-demo-caption-line
        className="mt-1 font-display text-2xl font-semibold leading-[1.15] tracking-[-0.0334em] text-white md:text-[28px]"
      >
        {CAPTION_WORDS.map((word, i) => (
          <span key={i} data-demo-caption-word className="mr-[0.25em] inline-block">
            {word}
          </span>
        ))}
      </p>
    </div>

    <div className="relative aspect-[2/1] w-full overflow-hidden">
      {/* video + play-button overlay unchanged */}
    </div>
  </div>
);
```

Notes:
- Caption is now in normal flow above the video = its REST position. Baseline line size 28px (`text-2xl` mobile / `md:text-[28px]`), eyebrow unchanged.
- Reveal/rise transforms (scale up, translateY) are applied by GSAP at runtime (Task 2), NOT in markup — at build/SSR the caption sits plainly at rest. The hook hides words via `gsap.set` before paint.
- `static` (reduced) variant: no transform, no z-index — just sits at rest above the video. Keep the play-button overlay block as-is inside the video frame.

**Step 4: Run the full test file, expect PASS.**

Run: `pnpm vitest run src/components/section-05/MacbookDemo.test.tsx`
Expected: PASS (all 4 tests — the 3 existing + the new one).

**Step 5: Commit.**

```bash
git add src/components/section-05/MacbookDemo.tsx src/components/section-05/MacbookDemo.test.tsx
git commit -m "refactor(section-05): caption above video frame, rest sizing"
```

---

### Task 2: Rewrite the desktop motion (scrubbed reveal + one-way rise)

**Files:**
- Modify: `src/components/section-05/useMacbookScrub.ts`

Motion is browser-verified (no unit test — jsdom has no layout/ScrollTrigger). Keep everything inside the existing `deferGsap` block alongside the pin.

**Step 1: Replace the Beat 1 + Beat 2 blocks.** Inside `setup()`, after grabbing `caption`/`eyebrow`/`words`, compute the reveal transform from measured geometry and wire two triggers:

```ts
const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

if (caption && words && words.length) {
  // Reveal transform: scale up to ~2x (line 28px -> ~56px) and translate DOWN
  // so the caption overlays the vertical centre of the video. Measured, not
  // hard-coded, so it stays centred responsively.
  const REVEAL_SCALE = 2;
  const captionH = caption.offsetHeight;
  const videoH = video.getBoundingClientRect().height || block.offsetHeight;
  // distance from caption's natural top to the video's vertical centre,
  // minus half the (scaled) caption height so it reads centred over the video.
  const revealY =
    captionH + videoH / 2 - (captionH * REVEAL_SCALE) / 2;

  if (isDesktop) {
    // Container starts in the big + over-video state (set here, never via
    // data-reveal). Beat 2 animates it back to identity (= rest).
    gsap.set(caption, { y: revealY, scale: REVEAL_SCALE });
  }
  // Words/eyebrow hidden for the de-blur reveal (Beat 1).
  gsap.set([eyebrow, ...words], { opacity: 0, y: 14, filter: "blur(10px)" });

  // Beat 1 — scrubbed per-word reveal, completes as block hits viewport centre.
  const revealTl = gsap.timeline({
    scrollTrigger: {
      trigger: block,
      start: "top bottom",
      end: "top center",
      scrub: 0.3,
    },
  });
  revealTl
    .to([eyebrow], { opacity: 1, y: 0, filter: "blur(0px)", ease: "power2.out", duration: 0.3 }, 0)
    .to([...words], {
      opacity: 1, y: 0, filter: "blur(0px)", ease: "power2.out",
      duration: 0.3, stagger: { each: 0.06, from: "start" },
    }, 0.15);

  // Beat 2 — one-way rise + shrink to rest above the video (desktop only).
  // Fires once at pin engage; never reverses, so it parks above the video.
  if (isDesktop) {
    gsap.timeline({
      scrollTrigger: { trigger: block, start: "top top", once: true },
    }).to(caption, { y: 0, scale: 1, ease: "power2.out", duration: 0.6 });
  }
}
```

**Step 2: Delete the old Beat 2 block** that tweened `caption` (`y: -60, scale: 0.82, opacity: 0`) inside the pin timeline `tl`. The pin timeline now scrubs only the video `currentTime`. Leave the pin/`onLeave` playback logic untouched.

**Step 3: Smoke-test in browser.** `pnpm dev`, load http://localhost:3000, scroll §05:
- Caption de-blurs in big, centred over the video as the block reaches centre.
- At pin engage it rises + shrinks to rest above the video, clearing the laptop screen — never overlaps "Design, build & deploy".
- Scroll back up: caption sits parked above the video, does not re-descend/re-fade over it.
- No console errors.

Tune `REVEAL_SCALE` / `revealY` if the reveal isn't centred or 56px doesn't fit one line at 1440.

**Step 4: Commit.**

```bash
git add src/components/section-05/useMacbookScrub.ts
git commit -m "feat(section-05): scrubbed reveal + one-way rise for demo caption"
```

---

### Task 3: Confirm mobile (reveal only, no rise)

**Files:** none expected — Task 2's `isDesktop` guards already gate the rise/over-video transform to desktop, so mobile gets the scrubbed word reveal only and the caption stays at rest above the laptop.

**Step 1: Smoke-test at 375px** (devtools responsive). Caption reveals once, sits clear above the laptop, no rise/shrink, no horizontal scroll, 24px gutters intact (`px-6`).

**Step 2:** If mobile reveal reads wrong (e.g. caption still wants a small lift), add a mobile-only nicety here — otherwise no commit needed.

---

### Task 4: Reduced motion + gate + visual review

**Step 1: Reduced-motion check.** Emulate `prefers-reduced-motion: reduce`. Scrub hook bails (`enabled: !reduced`), caption renders static at rest above the video, play-button overlay shows. No motion, fully legible.

**Step 2: Gate.**

```bash
pnpm lint && pnpm vitest run && pnpm build
```
Expected: all pass.

**Step 3: Visual review.** Confirm Playwright is available; if blocked, flag + skip. Otherwise invoke the `visual-reviewer` subagent (desktop 1440 FIRST, then 375). Loop fixes until PASS at both viewports.

**Step 4: Final commit** (if review fixes were applied).

```bash
git add -A && git commit -m "fix(section-05): visual-review polish for demo caption"
```
