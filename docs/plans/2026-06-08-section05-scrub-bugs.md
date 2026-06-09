# §05 Macbook scrub — two bugs (handoff + fix plan)

**Date:** 2026-06-08
**Status:** RESOLVED 2026-06-09 — see "Resolution" at the bottom. Fix A shipped as
planned (cb9f70d). Fix B (deferred teardown, 7c490b3) **did not hold** — probes showed
`scrollend` fires early on discrete scrolls (teardown still lands mid-scroll), and once
the user *has* settled past the seam the re-anchor target is wrong anyway. The teardown
approach was abandoned for a sticky-positioning architecture; this doc is kept as the
investigation record.
**Reported by Dan:** On mobile, after the laptop demo (§05) scrubs through and starts
playing, continuing to scroll **jerks down to the first pricing card and won't let you
scroll** normally. Also noticed: at a small/mobile-sized viewport the scrub feels
**laggier** than at full width.

This doc is the source of truth — implement against it. Investigation was done with a
headless-Chromium probe (no source was edited during investigation).

---

## Files involved

- `src/components/section-05/useMacbookScrub.ts` — the scrub hook (pin + scrub + onLeave teardown). **Primary fix site.**
- `src/components/section-05/MacbookDemo.tsx` — renders the video + caption, calls the hook. Has `variant: "desktop" | "mobile"`.
- `src/components/section-05/SectionClose.tsx` — renders **both** `SectionCloseDesktop` and `SectionCloseMobile`, toggled by CSS (`hidden lg:block` / `block lg:hidden`). **This is why both demos mount.**
- `docs/scroll-scrubbed-video-recipe.md` — the project's own recipe; documents Bugs 3/4/6 that the current `onLeave` teardown is built around. Read its "six bugs" section before changing the teardown.
- `/tmp/scrub-probe.mjs` — the throwaway Playwright probe used to confirm all of this. Re-run to verify a fix (see "Verification" below). Requires `pnpm dev` on :3000.

---

## Confirmed root causes (with evidence)

### Bug A — Phantom scrub trigger on the hidden off-variant (the lag)

`SectionClose` mounts **both** variants in the DOM; only one is visible (CSS `display`).
But `MacbookDemo` calls `useMacbookScrub` regardless of whether its variant is the
displayed one. The hook only bails on `!enabled` (reduced motion) or missing refs — it has
**no guard for a `display:none` / off-variant element**.

Consequence on a mobile-width viewport (proven by probe):
- 2 `[data-macbook-demo]` nodes exist; **3 pin-spacers** are created (hero + both demos).
- The hidden **desktop** demo has a zero-size box, so its `start: "top top"` pin resolves
  to **scroll 0** → it builds a real pinned scrub trigger over **y 0–500 at the top of the
  page**, and drives its `<video>` (`/videos/macbook-demo.mp4`, 7.5 MB, all-keyframe =
  decode-heavy) — seeking/scrubbing/playing **while invisible**. Probe caught its
  `currentTime` going 0→1.6 over the first 500px of scroll.

This wastes network + decode on the heavy desktop clip on mobile and is the likely source
of the "laggy at small viewport" feel. (Symmetric: on desktop width the hidden *mobile*
demo also builds a phantom trigger, just with the lighter 720p clip.)

### Bug B — `onLeave` teardown re-anchor fights iOS momentum (the jerk)

The §05 demo pins at the section, scrubs 500px (mobile) / 800px (desktop), then `onLeave`
fires (`useMacbookScrub.ts:128-153`):

```ts
onLeave: (self) => {
  startPlayback();
  const pin = self.pin;
  const savedTime = video.currentTime;
  self.disable(true);                          // removes the 500px pin-spacer → doc shrinks 500, content below leaps up
  if (isDesktop && caption) gsap.set(caption, { y: UP });
  if (Number.isFinite(savedTime) && savedTime > 0) video.currentTime = savedTime;
  if (pin) {
    const offset = pin.getBoundingClientRect().top;
    if (offset) window.scrollBy(0, offset);    // re-anchor demo to viewport top
  }
}
```

Probe capture of the handoff (mobile, headless Chrome), demo pins at doc-y ≈ 4004:

```
+500   y:4499  demoTop:0   spacers:2  vTime:1.97   (scrub complete, still pinned)
HANDOFF → scrollBy(0,-45.5);  y:4499 → 4003
+550   y:4003  demoTop:0   spacers:1  vPaused:false (spacer removed, video playing)
```

**Key insight:** the `scrollBy` offset was only **−45px, not −500**. Chrome's *scroll
anchoring* silently absorbed the spacer removal, so the re-anchor barely moves and nothing
visibly jumps. **That is why desktop/Chrome looks fine.**

iOS Safari does scroll anchoring differently AND is mid-*momentum flick* at that instant.
There the spacer removal is **not** absorbed → the first pricing card leaps ~500px up into
view, the full `scrollBy` correction fires against live momentum, and the two fight → the
"jerk down to the first pricing card, can't scroll." This is the recipe's documented Bug
3/4 region; the recipe warns the `onLeave` teardown is only safe "when scrub ends inside
the document," and a short pinned block with content right beneath it is the fragile case.

---

## Fix plan

### Fix A (do first — unambiguous, safe)

Stop the off-variant hook from building a trigger / loading its video.

Recommended approach: make `useMacbookScrub` bail when its element isn't actually rendered.
In `setup()` (after refs resolved), if the block has no layout box, do not create the
timelines/triggers:

```ts
// off-variant guard: the hidden (display:none) sibling must not build a trigger
if (block.offsetParent === null && getComputedStyle(block).position !== "fixed") return;
// or simpler/robust: const r = block.getBoundingClientRect(); if (r.width === 0 && r.height === 0) return;
```

Notes:
- Run the guard inside `setup()` (after fonts/metadata gate), not at hook top, so it
  measures real layout.
- Consider also gating the heavy `<video>`'s `preload` so the hidden desktop clip doesn't
  even fetch metadata on mobile — but the trigger guard is the essential part.
- This must not break the visible variant or reduced-motion. Verify with the probe that
  exactly **1** macbook pin-spacer exists on mobile (hero + 1 demo = 2 total), and that the
  hidden desktop video does not scrub at the top of the page.

### Fix B (do carefully — design-sensitive; verify in Chrome, then Dan verifies on iPhone)

Goal: make the scrub→play handoff not fight iOS momentum, **without** reintroducing the
recipe's Bug 4 (a gap appearing above the demo when scrolling back up).

**Recommended surgical approach — defer the teardown until scroll settles.** The jerk
happens because `disable(true)` + `scrollBy` run *during* the momentum flick. Instead:
- On `onLeave`, immediately `startPlayback()` and restore `currentTime` (keep the video
  correct), but **defer** the `self.disable(true)` + re-anchor until the user stops
  scrolling — e.g. on the `scrollend` event, or after a short rAF/velocity check that
  scroll velocity ≈ 0. While waiting, the pin-spacer stays (no layout shift mid-flick).
- When scroll has settled, do the disable + `scrollBy` re-anchor in one tick as today.
  Settled scroll → no momentum to fight → no jerk.
- Guard against the user scrolling back up before settle (cancel the deferred teardown if
  they re-enter the trigger range).

Fallback if `scrollend` proves unreliable on iOS: a short timeout/velocity-poll teardown.

**Acceptance for Fix B:**
- Chrome (probe + manual at 390px): handoff still re-anchors cleanly, video plays from the
  scrub-end frame (not frame 0 — recipe Bug 6), and scrolling back up shows **no gap**
  above the demo (recipe Bug 4).
- iPhone (Dan, manual): scrubbing through then continuing to scroll no longer jerks to the
  pricing card; you can scroll past the playing demo smoothly.

Do **not**: bump `anticipatePin` (recipe Bug 5); switch to `disable(false)` (recipe Bug 4);
use `disable(true, true)` (recipe Bug 6). Read `docs/scroll-scrubbed-video-recipe.md`
"six bugs" first.

---

## Verification (probe)

Dev server must be running (`pnpm dev`, :3000). Then:

```bash
node /tmp/scrub-probe.mjs
```

It launches headless Chromium at 390×844 (touch/mobile UA), counts pin-spacers, finds the
**visible** demo, scrolls through the scrub, and logs `y / docH / demoTop / spacers /
vTime / vPaused` plus any `window.scrollBy` calls at the handoff. Uses cached browser at
`~/Library/Caches/ms-playwright/chromium_headless_shell-1217/...` (edit path if the cache
version changed).

Expected after Fix A: on mobile, only **1** macbook pin-spacer (total 2 with hero); no
video scrubbing over y 0–500 at the top of the page.

Also run: `pnpm build` and `pnpm lint` before committing. There is `MacbookDemo.test.tsx` —
run `pnpm test` / vitest too.

---

## Branch / workflow

Current branch `feat/design-system-foundation`. Conventional commits. Don't commit to main.
Suggested commits: `fix(section-05): guard scrub hook against off-variant mount` (Fix A) and
`fix(section-05): defer scrub handoff teardown until scroll settles` (Fix B).

---

## Resolution (2026-06-09, branch `feat/section-05-scrub-fixes`)

Three shipped/attempted fixes against the same seam (off-variant guard, deferred
teardown, and the earlier rejected fill-the-gap experiment on
`feat/section-05-reference-plate`) met the "3+ fixes → question the architecture"
threshold. The architecture was the problem: **any** design that reclaims the pin
travel's document height at the handoff needs a scroll correction whose right value
depends on user position + live momentum — unknowable. So the travel was made
permanent layout instead:

- `MacbookDemo` wraps the demo block (`position: sticky; top: 0`) in a travel wrapper
  exactly `SCRUB_PX[variant]` taller via a **real spacer child**
  (`motion-safe:h-(--scrub-travel)`; collapses under reduced motion). Document height
  is constant from first paint — nothing to tear down, restore, or scroll-correct.
- `useMacbookScrub` lost all pin machinery and the whole teardown; the trigger (on the
  wrapper, not the sticky block) only scrubs `currentTime` and fires
  `onLeave: startPlayback` / `onEnterBack: pause + re-arm` (symmetric zone — scroll-up
  re-sticks and re-scrubs, so the recipe's Bug 4 gap is impossible in any rest state).
- `scrubConfig.ts` is the single source for the 800/500 travel (CSS var + trigger end).
- Gotcha discovered on the way: sticky travel via wrapper `padding-bottom` silently
  fails — sticky constrains to the parent's **content box**, so padding gives zero
  travel room. The spacer must be real content. (Recipe Bug 8.)

Verified with `/tmp/scrub-probe3.mjs` (desktop + mobile PASS: docH constant, max
unexplained jump 0px, no `scrollBy` calls, demo sticks through the zone, handoff
plays, re-entry pauses + re-scrubs, second pass hands off again), screenshots at all
scrub phases, vitest (27), lint, build. Recipe updated: Pattern B is now sticky-based;
Bugs 7 (teardown handoff jump) and 8 (padding travel) documented in
`docs/scroll-scrubbed-video-recipe.md`. Real-iPhone confirmation: Dan.
