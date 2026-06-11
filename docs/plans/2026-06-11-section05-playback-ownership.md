# §05 post-handoff scroll — playback ownership round (CLOSED)

**Date:** 2026-06-10 → 2026-06-11
**Status:** CLOSED 2026-06-11 — Dan confirmed on his real iPhone via the
preview share link ("Looks good on mobile"). Branch
`fix/section-05-playback-ownership`, three commits beyond main.
**Recipe:** Bugs 12, 13, 14 + sections B.3/B.4/B.5 in
`docs/scroll-scrubbed-video-recipe.md` are the canonical write-up. This doc is
the session record: what Dan reported, in order, and what each report turned
out to mean.

This is the third (and final) round of the §05 scrub saga:

- **Round 1** (2026-06-08, `2026-06-08-section05-scrub-bugs.md`): handoff
  jerk + off-variant phantom trigger → sticky travel architecture
  (recipe Bugs 7, 8).
- **Round 2** (2026-06-10, `2026-06-10-section05-ios-scrub-keyframes.md`):
  iOS frozen scrub → stale ScrollTrigger zone + iOS ignoring
  `preload="auto"` (recipe Bugs 10, 11; Bug 9 keyframes re-encoded en route).
- **Round 3** (this doc): everything *after* the handoff — the part nobody
  had specified, so the architecture's default (symmetric, re-entrant)
  shipped, and a real phone falsified it within minutes of testing.

---

## The three reports, in order

Each report arrived after the previous fix was verified locally (probes
green, build clean) and deployed to a preview. **All three behaviours were
invisible to desktop probes** — they only exist under real touch scrolling
with momentum, on a page the user is *reading* rather than driving.

### Report 1 — "reverse scrub out of nowhere"

Scrolling back up over the playing demo re-took the playhead: the lid
scrubbed closed over a video the user had already watched, the caption slid
back down over the open screen, and the `onEnterBack` pause froze the demo
on an open-lid frame with no path to `ended` (iOS momentum naturally rests
just inside the zone end).

**Dan's spec, verbatim distilled:** the scrub is freely bidirectional *until
the video really plays*; from that moment everything is fixed, forever.

**Fix (commit `0cc783c`):** one-shot ownership. A `played` flag flips at
first real playback (handoff, or replay button) and never flips back. The
scrub tween and the caption rise-off became **proxy tweens** whose `onUpdate`
is gated on `!played` — the timeline must stay alive (killing it kills the
trigger's enter/leave bookkeeping), so the writes are gated instead of the
timeline. The warm kiss's fake `play` is excluded via `data-warming`; a kiss
resolving mid-scrub no longer seeks to 0 (`data-inZone` guard).

### Report 2 — "I'm not moving anywhere for a few scrolls… and the video freezes"

Post-playback scroll-up still re-pinned the block: `position: sticky` is
stateless and re-engages on every re-cross, so the page ate `scrubPx` of
scroll travelling the zone in reverse — and the `onLeaveBack` park-pause
froze the video while fully visible.

**Dan's spec:** "once I've got to that point there should be no more
pinning. You should be able to scroll up as normal as if the video and the
header were never pinned at all."

**Fix (commit `990fe2b`):** retire the pin at handoff —
`block.style.position = "relative"; block.style.top = \`${scrubPx}px\`` —
pixel-identical to sticky's end-of-travel pose, constant document height,
invisible swap. Removed `onLeaveBack` entirely; the video is never paused by
scroll again. An IntersectionObserver resumes iOS's silent offscreen media
suspension (`played && paused && !ended → play()`).

### Report 3 — "there is a huge gap above the header now… this looks terrible"

Retiring the pin converted the consumed travel into `scrubPx` (800 desktop /
500 mobile) of dead black space above the block — a blank band between the
card-cluster section and the demo when scrolling back up. Predicted risk
("I was worried this woood happen"), confirmed immediately.

**Fix (commit `9834b52`):** deferred travel reclaim. The gap cannot be
removed at the handoff (document-height change under live scroll is the
round-1 jump bug), so it collapses at the first provably-invisible moment:
geometry classified as `above` / `below` / `visible` from the wrapper rect;
`above` → wait for 400ms of scroll quiet, then zero the spacer + clear the
inline styles + `scrollTo(0, y - scrubPx)` in the same task (net zero pixels
move); `below` → collapse immediately, even mid-scroll (nothing visible can
move); `visible` → wait, next scroll re-schedules. `ScrollTrigger.refresh()`
after. **2px epsilon on both boundaries** — whole-device-pixel `scrollY` vs
fractional rects left mobile 0.07px short of "above" forever (measured), so
strict comparisons deadlock the reclaim.

---

## Verification (final state, all three fixes)

- vitest 31/31, tsc clean, `pnpm build` clean.
- Fresh-load browser probes at 1440 and 390 (sessionStorage cleared +
  reload to defeat scroll restoration, which auto-triggers the handoff):
  - Quiet-path reclaim: desktop `scrollY` 8698.5 → 7899 (−800 exact), mobile
    4542 → 4042 (−500 exact); block-top drift ≤1px (sub-pixel); video playing
    throughout; previous section's cards sit directly above the demo with
    only natural section spacing (screenshot-confirmed).
  - Mid-scroll below-path: collapses with `scrollY` untouched.
  - Ended state survives round trips; replay re-takes ownership correctly.
- 0 console errors (one pre-existing THREE.Clock deprecation warning,
  unrelated).
- Dan, real iPhone, preview build `9834b52`: **confirmed**.

---

## Why this took three rounds (the process lesson)

1. **"Scrub hands off to playback" is three features, not one** — ownership
   (who may write the playhead), pin retirement (sticky is stateless), and
   travel reclaim (the consumed space). The original build specified the
   scrub precisely and the handoff not at all, so each post-handoff
   behaviour was an unexamined default. Recipe B.3/B.4/B.5 now specify all
   three; any future Pattern B build should implement them together, not
   discover them serially.
2. **Each fix exposed the next bug.** Ownership gating exposed the re-pin
   (the pause had been masking it); retiring the pin created the gap. None
   of these were regressions — they were always there, behind the previous
   bug. Budget for the chain when touching a handoff.
3. **Desktop probes are necessary, never sufficient.** Every round was
   probe-green before Dan's phone falsified it. The recipe now has a
   real-device test checklist; run it cold-cache before claiming done.
4. **The user's reports were the spec.** "As if the video and the header
   were never pinned at all" is a complete, testable acceptance criterion —
   better than the implementation-shaped framing ("gate onEnterBack") that
   preceded it.

## Invariants now encoded (where)

- One-shot ownership, proxy-gated writers, no scroll-driven pause —
  `useMacbookScrub.ts` architecture comment + recipe B.3 / Bug 12.
- Pin retirement at handoff, pixel-identical park — recipe B.4 / Bug 13.
- Deferred reclaim, never at the seam, 2px epsilon — recipe B.5 / Bug 14.
- Dense keyframes scripted, ffprobe check — `scripts/encode-video.sh` +
  recipe B.1 / Bug 9.
- Real-device checklist — recipe "Real-device test checklist".
- Cross-project distillation —
  `~/CodeProjects/claude-notes/build-lessons/scroll-scrub-handoff-ownership.md`.

## Addendum (2026-06-11, round 4): reclaim must fire on turn-back, not on quiet

Round 3's reclaim shipped and Dan's prod test found its gap — literally: a
user scrolling up *immediately* after the handoff outruns the 400ms quiet
timer, and once the gap is on screen the "visible → wait" state waits
forever. He rode the full `scrubPx` band up and watched it snap closed at the
far end. The state machine prevented a visible *collapse* but not a visible
*gap* — backwards priorities.

**Fix (branch `fix/section-05-reclaim-on-reveal`):** collapse the instant the
user turns back toward the gap, before it can be revealed:

- `touchstart` with the gap at/above the viewport top (`rect.top <= 2`) →
  collapse. Finger-down kills iOS momentum, so the same-task
  `scrollTo(y - scrubPx)` cannot fight it. Induction: on touch, revealing
  the gap requires an upward gesture, which always begins with a fresh
  finger-down → on touch devices the gap is now *unrevealable*.
- First upward scroll event with the gap at/above the viewport top and
  within one viewport (`rect.top + scrubPx > -innerHeight`) → collapse.
  Desktop wheel/trackpad deltas are relative and survive the re-anchor; the
  near-guard keeps far-away inertia and the iOS bottom rubber-band (scrollY
  briefly decreases) from triggering it.
- Quiet-timer ("above") and fully-below collapse remain as fallbacks; the
  only remaining "wait" state is real content visible above the seam
  (deep-link / Page Up edge), where any anchor would visibly move it.

Verified by probes at 1440 and 390: turn-back collapse fires on the first
upward step / touchstart with ≤0.5px block drift, video playing throughout;
below-path jump preserves scroll position exactly; quiet path still works.
Recipe B.5 + Bug 14 rewritten so following the recipe can't reproduce this.
