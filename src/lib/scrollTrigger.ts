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

// Test-only: vitest's fake timers discard in-flight rAFs between tests, so
// the `ticking` flag would lie and the pump would refuse to restart. Reset
// the queue between tests via `beforeEach`. Do not call from app code.
export function __resetDeferGsapQueueForTests() {
  queue.length = 0;
  ticking = false;
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
