# ScrollTrigger "undefined.end" race fix — implementation plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate the intermittent `Cannot read properties of undefined (reading 'end')` runtime crash that fires when the Materials¹ landing page loads, without changing any section's motion design or visual behaviour.

**Architecture:** Convert `deferGsap` from a per-component one-shot rAF helper into a **global serial queue** that processes one `setup()` per animation frame. The race exists because every section's `deferGsap` schedules into the same animation frame, so 5+ `ScrollTrigger.create` calls run back-to-back; gsap 3.15's backward iteration over `_triggers[]` reads `_triggers[i].end` on a prior timeline-based trigger whose `gsap.delayedCall(0.01, self.update)` hasn't fired yet (so `end === 0`), recurses into `curTrigger.refresh(0, 1)`, fires an `onEnter` on a `once: true` trigger, kills it mid-iteration, and leaves `_triggers[i]` undefined for the outer loop. Staggering one create per rAF gives the gsap ticker time to fire each deferred `delayedCall` between creates, so every prior trigger has a real `end` before the next iteration reads it. Then `ScrollRestore` is taught to hold its `html.scroll-restoring` visibility overlay until the queue drains, so a deep-scroll refresh doesn't show a scrub-state flash while triggers attach.

**Tech Stack:** Next.js 16 App Router · React 19 (Strict Mode in dev) · GSAP 3.15 · `@gsap/react` 2.x · TypeScript strict · Vitest · pnpm.

**Key references (read before starting):**
- `src/lib/scrollTrigger.ts` — current `deferGsap` implementation; this is the only file the core fix touches.
- `src/components/scroll-restore/ScrollRestore.tsx` — owns the `html.scroll-restoring` visibility overlay; gains a "queue drained" gate.
- `src/app/layout.tsx:16` — inline boot script that adds `scroll-restoring` when `sessionStorage` holds a non-zero saved y.
- `src/app/globals.css:127-129` — the `html.scroll-restoring body { visibility: hidden }` rule.
- `node_modules/gsap/ScrollTrigger.js:1363-1382` — the buggy backward iteration. Read once to confirm the diagnosis before changing anything.
- Memory: `feedback_scrolltrigger_defer.md` — prior fix attempt and why the rAF alone wasn't enough.
- Memory: `feedback_data_reveal_trap.md` — `[data-reveal]{opacity:0}` only on animated leaves; relevant if you ever need to debug "things stayed hidden".
- Memory: `project_materials_landing.md` — desktop-led project, §01 locked, work happens section-by-section.

**Project rules to respect (from CLAUDE.md):**
- Desktop is the primary canvas (1440×900). Mobile (375×667) must also pass.
- After any UI change, invoke `visual-reviewer` and loop until PASS at both viewports. *Note: this fix is non-visual, but verification still happens in a real browser at both viewports — see Task 7.*
- No new emojis in files, no new documentation files unless asked (this plan was asked for).
- `pnpm` over `npm`. Conventional commits.

**Testing approach:** This fix is a runtime race-condition mitigation, so unit tests on `deferGsap` alone can't prove the bug is gone (the race only manifests with real GSAP, real DOM, real timing). Strategy:
1. **Unit-test the queue semantics** with vitest + fake timers + a mocked `gsap.context` — proves the queue actually serialises and cleanup actually cancels.
2. **Manual browser verification** is the acceptance gate: refresh the running dev server 20+ times at three scroll positions (top, mid-§03, deep §05) with the browser console open. PASS = no `undefined.end` crash across all 60 refreshes.

**Branch:** Work on the current `feat/section-05-close` branch (where the user is). Do NOT create a new worktree — the rest of that branch's WIP must keep working alongside this fix. Commit each task as its own conventional commit so the fix is easy to revert in isolation.

---

## Task 1: Confirm the diagnosis in `node_modules/gsap/ScrollTrigger.js`

Before changing anything, read the gsap source to confirm the race is where the plan claims it is. This is a 2-minute check that prevents a wrong-cause fix.

**Files:**
- Read: `node_modules/gsap/ScrollTrigger.js:1322-1390` (the `self.refresh` definition and its backward iteration over `_triggers`)
- Read: `node_modules/gsap/ScrollTrigger.js:1925-1952` (the end of `ScrollTrigger.create` — `_triggers.push(self)`, `self.enable(...)`, the timeline vs non-timeline branch, the `gsap.delayedCall(0.01, self.update)`)

**Step 1: Verify the unsafe access**

Confirm line 1365-1366 reads:
```js
curTrigger = _triggers[i];
curTrigger.end || curTrigger.refresh(0, 1) || (_refreshing = self);
```
…with no null-check on `curTrigger`. Compare with line 1406 (`curTrigger = _triggers[i] || {};`) which IS defensive — proving this is a known-shape oversight in 3.15.

**Step 2: Verify the timeline-defer pathway**

Confirm lines ~1934-1947 set `start = end = 0` and schedule `gsap.delayedCall(0.01, self.update)` for timeline-attached triggers. This is the window where `_triggers[i].end === 0` for a prior trigger.

**Step 3: No commit**

This task produces no diff. Note any deviation from the description above in your reply to the user before proceeding.

---

## Task 2: Add a failing test for serial queue semantics

We TDD the queue logic. The setup callbacks themselves are opaque (real gsap), so we assert on **call ordering and timing** using vitest fake timers + a mock for `gsap.context`.

**Files:**
- Create: `src/lib/scrollTrigger.test.ts`

**Step 1: Check the test toolchain**

Run: `pnpm vitest --run --reporter=verbose src/lib 2>&1 | head -20`
Expected: vitest runs (may report "no test files found in src/lib"). If vitest is misconfigured, stop and report — don't proceed.

**Step 2: Write the failing test file**

```typescript
// src/lib/scrollTrigger.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock @/lib/gsap before importing scrollTrigger so the mock is in place.
const mockRevert = vi.fn();
const mockContext = vi.fn((setup: () => void) => {
  setup();
  return { revert: mockRevert };
});

vi.mock("@/lib/gsap", () => ({
  gsap: {
    context: (setup: () => void) => mockContext(setup),
  },
}));

import { deferGsap } from "./scrollTrigger";

describe("deferGsap serial queue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockContext.mockClear();
    mockRevert.mockClear();
    document.documentElement.classList.remove("scroll-restoring");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("processes one setup per animation frame, in registration order", () => {
    const calls: string[] = [];
    deferGsap(() => calls.push("A"));
    deferGsap(() => calls.push("B"));
    deferGsap(() => calls.push("C"));

    expect(calls).toEqual([]);

    vi.advanceTimersToNextFrame();
    expect(calls).toEqual(["A"]);

    vi.advanceTimersToNextFrame();
    expect(calls).toEqual(["A", "B"]);

    vi.advanceTimersToNextFrame();
    expect(calls).toEqual(["A", "B", "C"]);
  });

  it("skips a setup whose cleanup ran before its turn", () => {
    const calls: string[] = [];
    const cleanupA = deferGsap(() => calls.push("A"));
    deferGsap(() => calls.push("B"));

    cleanupA();

    vi.advanceTimersToNextFrame();
    vi.advanceTimersToNextFrame();
    expect(calls).toEqual(["B"]);
  });

  it("reverts the gsap.context when cleanup runs after setup fired", () => {
    deferGsap(() => {});
    vi.advanceTimersToNextFrame();
    expect(mockContext).toHaveBeenCalledTimes(1);

    // Capture the cleanup of a second registration and run it post-fire.
    const cleanup = deferGsap(() => {});
    vi.advanceTimersToNextFrame();
    expect(mockContext).toHaveBeenCalledTimes(2);

    cleanup();
    expect(mockRevert).toHaveBeenCalledTimes(1);
  });

  it("waits for html.scroll-restoring to clear before scheduling", () => {
    document.documentElement.classList.add("scroll-restoring");
    const calls: string[] = [];
    deferGsap(() => calls.push("A"));

    vi.advanceTimersToNextFrame();
    expect(calls).toEqual([]);

    document.documentElement.classList.remove("scroll-restoring");
    // MutationObserver fires as a microtask; flush it then advance a frame.
    return Promise.resolve().then(() => {
      vi.advanceTimersToNextFrame();
      expect(calls).toEqual(["A"]);
    });
  });
});
```

**Step 3: Run the test to confirm it fails**

Run: `pnpm vitest --run src/lib/scrollTrigger.test.ts`
Expected: All four tests fail — the first three because current `deferGsap` does NOT serialise (B and C fire in the same frame as A), the fourth may pass coincidentally on the current code. Note which tests fail and why before proceeding.

**Step 4: Commit the failing test**

```bash
git add src/lib/scrollTrigger.test.ts
git commit -m "test(scrolltrigger): add failing tests for serial queue semantics"
```

---

## Task 3: Implement the serial queue in `deferGsap`

Replace the per-component rAF with a module-level queue that fires one setup per rAF tick.

**Files:**
- Modify: `src/lib/scrollTrigger.ts` (rewrite the file — it's ~60 lines)

**Step 1: Rewrite `src/lib/scrollTrigger.ts`**

```typescript
"use client";

import { gsap } from "@/lib/gsap";

// Serialises gsap/ScrollTrigger setup across the entire page: every
// `deferGsap(setup)` call enqueues its setup, and a single rAF-driven tick
// processes one setup per animation frame. This is the workaround for gsap
// 3.15's `ScrollTrigger.create -> self.refresh` backward iteration over
// `_triggers`, which can read `_triggers[i].end` on a prior timeline-based
// trigger whose deferred refresh (`gsap.delayedCall(0.01, self.update)`)
// hasn't fired yet, recurse via `curTrigger.refresh(0, 1)`, fire an
// `onEnter` on a `once: true` trigger, kill it, splice `_triggers`, and
// leave the outer loop indexing past the new end of the array — the
// well-known "Cannot read properties of undefined (reading 'end')".
//
// One-per-rAF stagger gives the gsap ticker a chance to fire each prior
// trigger's `delayedCall` between creates, so every prior has a real `end`
// when the next iteration reads it. Race eliminated at the source.
//
// On top of the queue, we still wait for `html.scroll-restoring` to clear
// before scheduling — the inline boot script in `app/layout.tsx` adds it
// when `sessionStorage` holds a non-zero saved y, and `ScrollRestore`
// removes it once the page is back in place. Triggers created mid-restore
// can race independently of the queue, so we keep both belts.
//
// Setups are wrapped in `gsap.context()` so every tween/timeline/
// ScrollTrigger made inside `setup` is tracked together and reverted on
// cleanup. Cleanup before the queue reaches a setup simply skips it.

type Pending = {
  setup: () => void;
  capture: (ctx: gsap.Context) => void;
  isCancelled: () => boolean;
};

const queue: Pending[] = [];
let ticking = false;

function pump() {
  if (ticking) return;
  ticking = true;
  const tick = () => {
    const next = queue.shift();
    if (!next) {
      ticking = false;
      return;
    }
    if (!next.isCancelled()) {
      const ctx = gsap.context(next.setup);
      next.capture(ctx);
    }
    window.requestAnimationFrame(tick);
  };
  window.requestAnimationFrame(tick);
}

export function deferGsap(setup: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  let ctx: gsap.Context | null = null;
  let cancelled = false;

  const enqueue = () => {
    if (cancelled) return;
    queue.push({
      setup,
      capture: (c) => {
        ctx = c;
      },
      isCancelled: () => cancelled,
    });
    pump();
  };

  whenScrollSettled(enqueue);

  return () => {
    cancelled = true;
    ctx?.revert();
    ctx = null;
  };
}

const RESTORE_CLASS = "scroll-restoring";

function whenScrollSettled(run: () => void) {
  const root = typeof document === "undefined" ? null : document.documentElement;
  if (!root || !root.classList.contains(RESTORE_CLASS)) {
    run();
    return;
  }
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    observer.disconnect();
    window.clearTimeout(safety);
    run();
  };
  const observer = new MutationObserver(() => {
    if (!root.classList.contains(RESTORE_CLASS)) finish();
  });
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  // Safety net: if `ScrollRestore` never clears the class for some reason,
  // we still want triggers to come online.
  const safety = window.setTimeout(finish, 2500);
}

// Exposed for `ScrollRestore` to defer clearing its visibility overlay until
// the page's ScrollTriggers have all attached — avoids a brief scrub-state
// flash on a deep-scroll refresh. Resolves immediately if the queue is
// already empty.
export function whenDeferredGsapDrained(): Promise<void> {
  return new Promise((resolve) => {
    if (!ticking && queue.length === 0) {
      resolve();
      return;
    }
    const check = () => {
      if (!ticking && queue.length === 0) {
        resolve();
        return;
      }
      window.requestAnimationFrame(check);
    };
    window.requestAnimationFrame(check);
  });
}
```

**Step 2: Run the tests to verify they now pass**

Run: `pnpm vitest --run src/lib/scrollTrigger.test.ts`
Expected: All four tests PASS.

**Step 3: Run the type-checker**

Run: `pnpm exec tsc --noEmit`
Expected: No errors.

**Step 4: Commit**

```bash
git add src/lib/scrollTrigger.ts src/lib/scrollTrigger.test.ts
git commit -m "fix(scrolltrigger): serialise creates one-per-rAF via a global queue

GSAP 3.15's ScrollTrigger.create backward-walks _triggers and reads
_triggers[i].end without a null-check (line 1366 of the published source).
When a prior timeline-based trigger still has end=0 (its delayedCall hasn't
fired) the recursive curTrigger.refresh(0,1) can fire an onEnter on a
once:true trigger, kill it, splice _triggers, and the outer loop indexes
past the new array length. One-per-rAF stagger gives the gsap ticker time
to fire each prior trigger's delayedCall between creates."
```

---

## Task 4: Add a failing test for `whenDeferredGsapDrained`

Verify the drain helper resolves only after the queue is empty.

**Files:**
- Modify: `src/lib/scrollTrigger.test.ts`

**Step 1: Append the new test**

```typescript
import { deferGsap, whenDeferredGsapDrained } from "./scrollTrigger";

describe("whenDeferredGsapDrained", () => {
  // (same beforeEach/afterEach as the previous describe — refactor if you
  // prefer, but duplication is fine for two short blocks.)

  it("resolves immediately when nothing is queued", async () => {
    const promise = whenDeferredGsapDrained();
    vi.advanceTimersToNextFrame();
    await expect(promise).resolves.toBeUndefined();
  });

  it("waits for every pending setup to fire before resolving", async () => {
    const fired: string[] = [];
    deferGsap(() => fired.push("A"));
    deferGsap(() => fired.push("B"));

    let drained = false;
    const promise = whenDeferredGsapDrained().then(() => {
      drained = true;
    });

    vi.advanceTimersToNextFrame();
    expect(fired).toEqual(["A"]);
    expect(drained).toBe(false);

    vi.advanceTimersToNextFrame();
    expect(fired).toEqual(["A", "B"]);

    // One more frame for the drain check to observe the empty queue.
    vi.advanceTimersToNextFrame();
    await promise;
    expect(drained).toBe(true);
  });
});
```

**Step 2: Run the tests**

Run: `pnpm vitest --run src/lib/scrollTrigger.test.ts`
Expected: PASS (the helper was implemented in Task 3, this just locks the contract). If anything fails, fix the helper before proceeding.

**Step 3: Commit**

```bash
git add src/lib/scrollTrigger.test.ts
git commit -m "test(scrolltrigger): lock whenDeferredGsapDrained drain contract"
```

---

## Task 5: Hold the scroll-restore overlay until the queue drains

`ScrollRestore` currently removes `html.scroll-restoring` (which un-hides body) right after restoring the saved y. On a deep refresh that means trigger creation runs visibly — for the LibraryPlateStack scrub or the MacbookDemo pin, the user could see one frame of intro-state before the scrub catches up. Holding the overlay until the queue drains pushes both behind the same curtain.

**Files:**
- Modify: `src/components/scroll-restore/ScrollRestore.tsx:35-44` (the `clearOverlay` / `restore` block)

**Step 1: Update the restore flow**

In `src/components/scroll-restore/ScrollRestore.tsx`, change the import block and the `restore` function:

```typescript
// Add to the existing imports near the top of the file:
import { whenDeferredGsapDrained } from "@/lib/scrollTrigger";
```

Replace the existing `clearOverlay` + `restore` definitions (around lines 35-45) with:

```typescript
    const clearOverlay = () => {
      document.documentElement.classList.remove("scroll-restoring");
    };

    const restore = () => {
      window.scrollTo(0, savedY);
      rafC = requestAnimationFrame(() => {
        window.scrollTo(0, savedY);
        // Hold the visibility overlay until every queued ScrollTrigger
        // setup has fired — otherwise a deep-scroll refresh briefly shows
        // section-3 plates / section-5 macbook in intro state before the
        // scrub catches up.
        whenDeferredGsapDrained().then(clearOverlay);
      });
    };
```

The `safetyId = window.setTimeout(clearOverlay, 2000);` line stays as-is — it still backstops the case where drain never resolves for any reason.

**Step 2: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/components/scroll-restore/ScrollRestore.tsx
git commit -m "fix(scroll-restore): hold visibility overlay until ScrollTriggers attach

Prevents a one-frame flash of intro-state plates / macbook on a deep-scroll
refresh while the serialised deferGsap queue processes the page's triggers."
```

---

## Task 6: Smoke-test the running dev server

Before delegating to `visual-reviewer`, manually verify nothing visually changed and the crash is gone. This honours the project memory: `feedback_verify_before_review.md` — reviewer is for polish, not first-pass sanity.

**Files:** none.

**Step 1: Start the dev server if not already running**

Run: `lsof -i :3000 -P -n 2>/dev/null | head` to check.
If not running: `pnpm dev` in a background terminal.

**Step 2: Hard-refresh test at three scroll positions**

In the user's browser:
1. Navigate to `http://localhost:3000`. Open DevTools console.
2. Refresh 10× at the top. Watch for `Cannot read properties of undefined (reading 'end')`. Expected: zero hits.
3. Scroll to mid-§03 (LibraryPlateStack). Refresh 10×. Expected: zero hits, page restores to scroll position, plates animate in correctly.
4. Scroll deep into §05 (MacbookDemo). Refresh 10×. Expected: zero hits, page restores, macbook scrub engages without flashing intro state.

If ANY refresh hits the error, stop and report — do not proceed to Task 7.

**Step 3: Verify motion still feels right**

Scroll through the page once end-to-end. Confirm:
- Hero pin scrub still pins and scrubs.
- §02 reveals still play on entry.
- §03 LibraryPlateStack still fans out as you scroll past.
- §03 LibraryTestimonial still reveals.
- §04 reveals + recipe still play.
- §05 MacbookDemo still pins and scrub-plays the video.

No commit — verification step.

---

## Task 7: Visual review at both viewports

Per CLAUDE.md, every UI change goes through `visual-reviewer`. This change is non-visual by design, but the verification confirms that.

**Files:** none.

**Step 1: Invoke the visual-reviewer subagent**

Use the Agent tool with `subagent_type: "visual-reviewer"`. Prompt:

> Verify that the recent ScrollTrigger queue fix did NOT change any visible behaviour on the Materials¹ landing page. The fix moved ScrollTrigger creation into a global serial queue (one create per animation frame) and now holds the scroll-restore visibility overlay until the queue drains. Test desktop FIRST (1440×900), then mobile (375×667). At each viewport: refresh at the top, refresh after scrolling to §03, refresh after scrolling into §05. Compare against expectations from CLAUDE.md (§01–§05 motion, reveals, pins, scrubs). Watch console for any `undefined.end` error. PASS = no console errors, all motion behaves identically to the locked design.

**Step 2: Loop on reviewer report**

If the report is not PASS at both viewports, address the specific findings and re-run the reviewer. Do NOT mark the plan complete on a partial pass.

**Step 3: No commit at this task**

The reviewer's report is informational. Any fixes it triggers get their own commits in this task chain before the reviewer is re-run.

---

## Task 8: Update the project memory note

The `feedback_scrolltrigger_defer.md` memory describes the prior fix (rAF + gsap.context). It needs to reflect the new serialisation behaviour so the next session doesn't undo this work.

**Files:**
- Modify: `/Users/Danny/.claude/projects/-Users-Danny-CodeProjects-materials-website/memory/feedback_scrolltrigger_defer.md`

**Step 1: Replace the "Update (2026-05-28)" block**

Replace it with a fresh dated update that says:
- The rAF-only deferGsap was insufficient because GSAP 3.15's `ScrollTrigger.create` backward iteration races independently of scroll-restore timing.
- `deferGsap` now serialises ALL setups through a module-level queue, one per rAF.
- `ScrollRestore` holds `html.scroll-restoring` until `whenDeferredGsapDrained()` resolves.
- Every existing `deferGsap(() => …)` call site still works unchanged — keep wrapping with `deferGsap`.

Keep the original "Why" and the original update block above it for history. The memory file's frontmatter `description` line may need a tweak so the index hook still reflects what the memory is about.

**Step 2: No commit**

Memory files live outside the repo. No git action needed.

---

## Done criteria

- [ ] Vitest passes for `src/lib/scrollTrigger.test.ts` (Tasks 3 & 4).
- [ ] `pnpm exec tsc --noEmit` is clean.
- [ ] 30 manual refreshes across three scroll positions produce zero `undefined.end` console errors (Task 6).
- [ ] `visual-reviewer` PASS at 1440×900 AND 375×667 (Task 7).
- [ ] Memory note updated (Task 8).
- [ ] Each task has its own conventional commit on `feat/section-05-close`.

## Rollback

If anything goes wrong, the fix is contained in two files. To revert:

```bash
git log --oneline | grep -E "scrolltrigger|scroll-restore" | head
git revert <commit-shas>
```

The pre-fix behaviour was the rAF-only `deferGsap` from commit `2bc3a46` era. The crash returns, but no design regresses.
