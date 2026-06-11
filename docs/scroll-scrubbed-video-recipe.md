# Scroll-scrubbed video recipe

How to drive a `<video>` from scroll position with GSAP ScrollTrigger so it
feels buttery, without falling into the fourteen bugs we hit getting there.

This recipe is written to be portable to any project. The two implementations
that grew this guide are:

- **Hero pattern** — long, heavy-smoothed scrub that bleeds into other timeline
  animations. Optimised for "glide." (`src/components/hero/*` in this repo.)
- **Demo pattern** — short, precise scrub that ends, then the video plays
  normally to its end. Optimised for "exact frames." (`src/components/section-05/MacbookDemo.tsx`
  + `useMacbookScrub.ts` in this repo.)

They diverge on encoding, scrub smoothing, and — critically — on *how the
element pins*. The hero pattern uses GSAP pinning (`pin: true`). The demo
pattern **must not**: when a scrub ends *inside* the document and hands off to
normal playback, any pin-spacer teardown changes document height mid-scroll
and produces a cross-browser handoff jump (Bug 7). The demo pattern pins with
`position: sticky` + a travel spacer instead — and the handoff is **one-shot**:
once real playback starts, scroll never touches the demo again (Bugs 12–14).
Decide which pattern you want **before** picking values — they trade off
against each other.

---

## Quick decision

| You want… | Pattern | Encoding | `scrub` | Scrub distance | Pinning |
|---|---|---|---|---|---|
| Long, glide-y intro that fades into other reveals | **Hero** | Default H.264 (sparse keyframes) | `0.5` | `+=3000`-ish | GSAP `pin: true` (`pinType: "fixed"`) |
| Precise frame-by-frame scrub then autoplay | **Demo** | Dense-keyframe H.264 (`-g 6`) | `0.3` | `+=500–800` | `position: sticky` + travel spacer — **no GSAP pin, no teardown** (Bug 7), retired one-shot at handoff (Bugs 12–14) |

If you're not sure, start with **Hero**. It's more forgiving and the heavy
smoothing hides a lot of imprecision. Reach for **Demo** only if the scroll-
to-frame coupling is the whole point of the section.

---

## Common foundations (both patterns)

These apply regardless of which pattern you pick.

### 1. The video element

```html
<video
  muted
  playsInline
  preload="auto"           <!-- "metadata" on mobile -->
  poster="/path/poster.jpg"
  aria-hidden="true"
>
  <source src="/path.webm" type="video/webm" />
  <source src="/path.mp4"  type="video/mp4" />
</video>
```

- `muted` + `playsInline` are required for autoplay/scrub on mobile Safari.
- `preload="auto"` on desktop, `"metadata"` on mobile keeps the mobile data
  bill low while still giving you `video.duration` immediately. **iOS Safari
  ignores `preload="auto"` entirely** — it fetches zero media data until a
  real `play()`. If the scrub must have buffered frames on iOS, you need the
  warm kiss (Bug 11).
- Always ship a poster — it's what users see while the video buffers and
  during `prefers-reduced-motion`.

### 2. `pinType: "fixed"` (critical — hero pattern only)

> Applies to GSAP-pinned scrubs (Pattern A). Pattern B doesn't use `pin` at
> all — see B.2.

```ts
scrollTrigger: {
  // …
  pin: true,
  pinType: "fixed",      // default is "transform" — DON'T use it
  anticipatePin: 1,
}
```

Default `"transform"` pins by setting a CSS transform; the browser scrolls one
frame, JS counter-translates the next, you see jitter on every scroll tick.
`"fixed"` takes the element out of flow with `position: fixed`, so there's no
catch-up frame. See **Bug 2** below for the symptoms.

**Caveat:** `position: fixed` won't work if any ancestor has a CSS transform
(transforms create a new containing block, which traps `fixed`). Audit the
ancestor chain before you commit. If you can't move the element out of the
transformed subtree, you have to accept `pinType: "transform"` and Bug 2's
jitter.

### 3. `anticipatePin: 1` — and **do not bump it**

GSAP looks ahead by `velocity × anticipatePin` to engage the pin a frame early
on fast scroll. The value `1` is the sweet spot: enough to catch most fast
scrolls, not enough to engage the pin while the user is still 50–100px above
the trigger. Going to `2` introduces a visible upward snap on slow scroll
(**Bug 5**). The "fast scroll swing" people try to fix by bumping this is
almost always the scrub-smoothing tween catching up — that's a `scrub` value
question, not an `anticipatePin` question.

### 4. `video.duration` is `NaN` until metadata — but don't gate a mid-page trigger on it

If you create a tween targeting `currentTime: video.duration` before metadata
loads, the target value is `NaN` and the scrub silently does nothing. There
are two correct answers, and which one you take **depends on where the
trigger sits**:

- **Top-of-page (hero):** wait for `loadedmetadata`, then build. The user is
  at scroll 0 while it loads — no race.

  ```ts
  if (video.readyState >= 1 && Number.isFinite(video.duration)) {
    setup();
  } else {
    video.addEventListener("loadedmetadata", setup, { once: true });
  }
  ```

- **Mid-page (demo):** **build the trigger at mount and never wait for the
  network.** On a slow connection, gating trigger creation on metadata leaves
  the zone unregistered until the user may already be inside or past it — a
  frozen scrub by a second path (Bug 10's secondary factor). Use a known
  clamp instead of the live duration: `Math.min(2, video.duration || 2)`.
  Writes past the real duration are clamped by the element — cosmetic only.

### 5. Strict Mode / React 19 race — defer the creation

GSAP 3.15 + React 19 Strict Mode race-conditions ScrollTrigger registration on
double-mount and you get `Cannot read properties of undefined (reading 'end')`.
Wrap every ScrollTrigger creation in a microtask-deferred helper:

```ts
// lib/scrollTrigger.ts
export function deferGsap(fn: () => void | (() => void)) {
  let cleanup: void | (() => void);
  const id = requestAnimationFrame(() => { cleanup = fn(); });
  return () => {
    cancelAnimationFrame(id);
    cleanup?.();
  };
}
```

Then use `deferGsap(() => { /* setup */ })` inside your effect. This is a
project-wide rule, not specific to scrubbed video.

### 6. Don't call `ScrollTrigger.refresh()` from inside a deferred setup

If two components both defer their trigger registration in the same Strict
Mode mount, calling `refresh()` from one of them re-runs the other's
half-initialised setup → the "undefined.end" race resurfaces. Let GSAP refresh
on its own; the global `useGSAP` setup is sufficient.

### 7. Reduced-motion fallback

Every scrub gets an `enabled` flag wired to `prefers-reduced-motion`:

```ts
const reduced = useReducedMotion();
useScrub({ enabled: !reduced, /* … */ });
```

Inside the hook: when `enabled === false`, don't create the timeline at all.
The video remains in its rest state (poster + optional replay button), no pin
spacer is added, no scroll behaviour is altered. **Don't try to make the scrub
"still work but smaller" under reduced motion — just turn it off.**

---

## Pattern A — Hero "glide"

The video pins to the top of the viewport and scrubs through its full duration
over a long scroll distance, with other timeline animations (logo, headline,
gradients) tied to scrub progress. When scrub completes, the user is already
scrolling into the next section — there's no need to "play" the video.

### A.1 — Encoding

Default H.264 is fine. **You do not need all-keyframes.** The heavy `scrub`
smoothing visually averages out the seek imprecision; the user never notices
that `currentTime` writes are snapping to the nearest keyframe ~6 frames away,
because the smoothing tween is already gliding through that range.

Standard MP4 + WebM both work. Provide a 720p variant for mobile.

### A.2 — Trigger config

```ts
gsap.timeline({
  scrollTrigger: {
    trigger: sectionRef.current,
    start: "top top",
    end: "+=3000",        // long — gives the scrub room to breathe
    scrub: 0.5,           // heavy smoothing — that's the "glide" feel
    pin: true,
    pinType: "fixed",
    anticipatePin: 1,
  },
})
  .to(video, {
    currentTime: video.duration || 1,
    ease: "none",
    duration: 1,          // normalised — actual time comes from `scrub`
  })
  // …then add the rest of your reveal tweens with offsets like 0.05, 0.40, 0.80
  .to(logo, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.15 }, 0.05)
  .to(video, { x: "-28%", scale: 0.78, duration: 0.15 }, 0.40)
  // …
```

Key choices:

- **`end: "+=3000"`** — a long virtual scroll distance. Every actual pixel of
  scroll moves the timeline only ~0.03%. That low rate is what makes scrub
  feel like a "glide," not a "scrub."
- **`scrub: 0.5`** — heavy smoothing. The timeline chases scroll position over
  ~500ms. On fast scroll, you see a beautiful catch-up swing; on slow scroll,
  perfectly smooth.
- **One timeline does everything.** Video, logo, headline, gradient — all
  tweened on the same scrub-driven timeline at different offsets. No second
  ScrollTrigger.
- **No `onLeave` teardown.** When scrub completes, the user is past the
  section; the pin un-engages naturally as they leave. Nothing to clean up.

### A.3 — Mobile address-bar resize

Mobile browsers resize the visual viewport when the address bar shows/hides.
That re-fires ScrollTrigger's refresh, which can re-pin and visibly jump.

```ts
ScrollTrigger.config({ ignoreMobileResize: true });
```

Set this **once**, somewhere global, before any scrubbed-video trigger is
created. (See `useHeroTimeline.ts:22` in this repo.)

---

## Pattern B — Demo "scrub then play"

The video pins, scrubs through a portion of its duration in lockstep with
scroll, and at the end of the scrub it **continues playing normally** to its
real end. After playback finishes you usually show a replay overlay. Used for
product demos where the first few seconds are scroll-controlled "teasers" and
the rest is a normal video.

This pattern is **harder** because the transition from scrub-controlled to
playback-controlled is where most of the bugs live (Bugs 3, 4, 6).

### B.1 — Encoding: dense-keyframe H.264 (`-g 6`)

For pattern B, encode with a keyframe every few frames. The user is in tight
positional control of the playhead during scrub, and you don't have the
heavy smoothing to mask snap-to-keyframe seeks.

```bash
ffmpeg -y -i source.mov \
  -vf "scale=-2:1080" \
  -vcodec libx264 -crf 26 -preset slow \
  -g 6 -keyint_min 6 -sc_threshold 0 \
  -movflags +faststart -an demo.mp4
```

- `-g 6 -keyint_min 6` → keyframe every 6 frames (0.1s at 60fps). Every seek
  decodes ≤6 frames — imperceptible. We started with all-intra (`-g 1`,
  19MB); `-g 6` scrubs identically at less than half the size (7.5MB at
  1080p). x264's **default is GOP 250** (~4.17s at 60fps) — one keyframe in a
  whole 2s scrub window; that's Bug 1 (and the regression in Bug 9).
- `-sc_threshold 0` → disable scene-change keyframe insertion (redundant).
- `-movflags +faststart` → moov atom at front so playback can start before the
  full file downloads.

**Don't try WebM/VP9 all-keyframes** — same clip ballooned to 56MB. H.264 is
the right format here.

Provide a 720p variant for mobile (`-vf "scale=-2:720"`, same flags) and a
poster image.

**Every shipped encode lives in a checked-in script** (here:
`scripts/encode-video.sh`) — never an ad-hoc terminal command. Bug 9 happened
because a quick one-off re-encode silently dropped the `-g` flags and shipped
a GOP-250 file.

### B.2 — Pin with `position: sticky`, not GSAP

> **History:** this section originally used `pin: true` + an elaborate
> `onLeave` teardown (`disable(true)` + `currentTime` save/restore +
> `scrollBy` compensation — the Bug 3/4/6 fixes). That teardown is
> **structurally broken** — the document-height change at the handoff is the
> jump (Bug 7). Don't resurrect it.

The pin is plain CSS. The block is `position: sticky; top: 0` inside a
wrapper that is exactly `scrubPx` taller than it, the extra height coming
from a **real spacer child** (not padding — Bug 8):

```html
<div class="travel-wrapper relative" style="--scrub-travel: 800px">
  <div class="demo-block sticky top-0">
    <!-- caption + video frame -->
  </div>
  <!-- collapses to 0 under prefers-reduced-motion -->
  <div aria-hidden class="motion-safe:h-(--scrub-travel)"></div>
</div>
```

The block sticks at the viewport top and travels `scrubPx` natively. The
travel is real, permanent layout from first paint: the document **never
changes height**, so there is nothing to tear down, restore, or
scroll-correct at the handoff. Stick/unstick is compositor-driven, so it
can't lag an iOS momentum flick the way a JS-timed position swap can.

The ScrollTrigger only maps scroll → `currentTime` — through a **proxy
object**, gated on ownership (see B.3 for why):

```ts
let played = false;            // ONE-SHOT — flips true at first real playback, never back

const tl = gsap.timeline({
  scrollTrigger: {
    // The WRAPPER, not the sticky block — the block's rect moves while
    // stuck; the wrapper's doesn't.
    trigger: travelRef.current,
    start: "top top",
    end: `+=${scrubPx}`,    // 800 desktop / 500 mobile worked well
    scrub: 0.3,             // tight smoothing — frames track scroll closely
    onLeave: () => startPlayback(),   // that's the whole handoff
    onEnterBack: () => {
      // Only meaningful PRE-handoff (fast flick past the end, then back up:
      // the scrub re-takes the playhead). Post-handoff: do nothing, ever.
      if (played) return;
      video.pause();
    },
  },
});

const scrub = { t: 0 };
tl.to(scrub, {
  t: scrubDuration,              // partial duration — leave room to "play out"
  ease: "power1.in",             // front-loads scroll onto the opening frames
  duration: 1,
  onUpdate: () => {
    if (!played) video.currentTime = scrub.t;   // ownership gate
  },
  onComplete: startPlayback,     // fires if user scrolls to end smoothly
});
```

Notes:

- **Two ways `startPlayback` can fire** — `onComplete` (smooth scroll to end)
  and `onLeave` (fast scroll past end). Idempotency-guard with the `played`
  flag so calling it twice is harmless.
- **Tween a proxy, never the video directly.** Killing the timeline at
  handoff also kills the trigger's enter/leave bookkeeping, so the timeline
  must stay alive — which means it keeps mapping scroll inside the zone
  forever. The proxy + `if (!played)` gate keeps the bookkeeping and drops
  the writes (Bug 12).
- **`scrubDuration` should be < `video.duration`.** The "play normally" phase
  needs frames left over to play. `Math.min(2, video.duration || 2)` works
  well — first 2 seconds are scrub-controlled, the rest plays out.
- **`scrub: 0.3` not `0.5`.** This pattern needs tighter tracking so the
  scrubbed frame matches the scroll position closely. The hero's `0.5`
  smoothing would feel sluggish here.
- **The zone is symmetric only until real playback starts.** Pre-handoff the
  user can scrub the lid open and closed freely. The moment the video really
  plays, the zone is done — see B.3.
- **Sticky needs a clean ancestor chain.** Any ancestor that creates a scroll
  container (`overflow: hidden/auto/scroll` on either axis) breaks sticking.
  `overflow-x: clip` is the sticky-safe way to clip horizontal bleed.
- **Reduced motion:** the spacer is `motion-safe:` so it collapses to zero —
  no scrub, no travel, no dead space. The hook bails before creating any
  trigger.

### B.3 — Playback ownership is ONE-SHOT

> **History:** the first sticky implementation treated the zone as symmetric
> *after* playback too — scrolling back up paused the video and re-took the
> playhead (`onEnterBack: { played = false; video.pause(); }`). On a real
> phone that produced three distinct user-facing bugs (Bug 12). Don't
> resurrect it.

The rule: **once real playback starts, scroll never touches the demo again.**
One flag, flipped once, never reset:

- `played` flips `true` in `startPlayback()` (handoff) and on any real `play`
  event (the replay button) — excluded only for the warm kiss's fake play
  (Bug 11), via its `data-warming` marker.
- Every scroll-driven writer is gated on `!played`: the `currentTime` proxy,
  any caption/overlay transform proxy. The trigger callbacks early-return.
- **Nothing scroll-driven ever pauses the video again.** No `onLeaveBack`
  pause, no `onEnterBack` pause. A scroll-paused video is indistinguishable
  from a broken one, and a pause inside the zone can strand the demo with no
  path to `ended` (Bug 12).
- The one legitimate post-handoff resume: iOS suspends media that scrolls
  fully offscreen mid-playback (silently leaves it paused). Keep an
  `IntersectionObserver` that resumes on re-entry:
  `if (played && video.paused && !video.ended) video.play()`. `ended` stays
  ended — the replay overlay owns that state.

### B.4 — Retire the pin at handoff

`position: sticky` is stateless — it happily re-engages every time the
scroll range is re-crossed. Left alone, scrolling back up post-playback
re-pins the block through the whole travel: the page visibly "stops
scrolling" for `scrubPx` before releasing (Bug 13).

At handoff, convert the block to static layout **at the exact pixel position
sticky is already holding** (end of travel):

```ts
const startPlayback = () => {
  if (played) {
    // Re-crossing the handoff with ownership live — just undo an iOS
    // offscreen suspension if one happened.
    if (video.paused && !video.ended) video.play().catch(() => {});
    return;
  }
  played = true;
  block.style.position = "relative";
  block.style.top = `${scrubPx}px`;   // pixel-identical to sticky's end-of-travel pose
  armTravelReclaim();                  // B.5
  video.play().catch(() => {});
};
```

Document height is unchanged, the block doesn't move a pixel, and sticky can
never re-pin. Post-handoff the section scrolls as if nothing was ever pinned.

### B.5 — Reclaim the travel — before the gap can ever be SEEN

Retiring the pin (B.4) leaves the consumed travel as `scrubPx` of dead space
*above* the block — a huge blank band between sections when the user scrolls
back up (Bug 14). It has to be reclaimed, and Bug 7's law still holds — you
cannot change document height under a live scroll at the seam.

Our first version waited for a provably-invisible moment (gap offscreen AND
scroll quiet for 400ms, or section fully below the viewport). That logic is
correct but **incomplete**: a user who turns back *right after* the handoff
outruns the quiet timer, and once the gap is on screen "wait for invisible"
waits forever — they ride the whole gap up and watch it snap closed at the
far end (Bug 14's second report). The reclaim must fire **the instant the
user turns back toward the gap, before it can be revealed**:

```ts
const reclaimTravel = (state: "above" | "below") => {
  const y = window.scrollY;
  block.style.position = "";
  block.style.top = "";
  travel.style.setProperty("--scrub-travel", "0px");      // spacer → 0
  if (state === "above") window.scrollTo(0, y - scrubPx); // same task — net zero pixels move
  ScrollTrigger.refresh();                                 // re-anchor triggers below
};

// 1) Finger-down: iOS momentum is dead, the scroll position is ours for one
//    task. Gap at/above the viewport top → collapse NOW. Revealing the gap
//    on touch always requires an upward gesture, which always begins with a
//    fresh touchstart — so on touch devices the gap can never be revealed.
const onReclaimTouch = () => {
  if (reclaimed) return;
  if (travel.getBoundingClientRect().top <= 2) reclaimTravel("above");
};

// 2) First upward scroll event near the gap (desktop wheel/trackpad —
//    relative deltas survive the same-task re-anchor). The near-guard (gap
//    within one viewport) keeps far-away inertia and the iOS bottom
//    rubber-band (scrollY briefly decreases) from triggering it. rect.top
//    <= 2 keeps it off the deep-link/Page-Up case where real content is
//    visible above the seam — anchoring the block then would visibly slam
//    that content down.
const onReclaimScroll = () => {
  if (reclaimed) return;
  const y = window.scrollY;
  const turnedBack = y < lastY;
  lastY = y;
  const rect = travel.getBoundingClientRect();
  if (rect.top >= window.innerHeight - 2) return reclaimTravel("below");
  if (turnedBack && rect.top <= 2 && rect.top + scrubPx > -window.innerHeight)
    return reclaimTravel("above");
  // otherwise re-schedule the 400ms quiet fallback
};
```

(2px tolerance on every geometry comparison: scrollY lands on whole device
pixels while measured geometry is fractional — without it a user resting at
the handoff point sits a sub-pixel short of "above" forever.)

The anchors:

- **"above"-anchored** (gap at/above the viewport top — `rect.top <= 2`):
  collapse, then re-anchor `scrollY` by the same `scrubPx` **in the same
  task** — no paint between collapse and correction. The block and everything
  below it hold pixel-fixed; whatever sliver of gap was showing swaps
  black → previous section's bottom (black-on-black on a dark page). The
  absolute `scrollTo` is only safe with no opposing momentum live — which is
  exactly what touchstart and relative wheel deltas guarantee.
- **"below"** (user jumped back above the section): nothing visible moves
  and `scrollY` stays valid — safe to run immediately, even mid-scroll.
- **Fallbacks:** the 400ms scroll-quiet timer (inputs that produce neither a
  touchstart nor an upward event before parking), and "wait" only for the
  rare deep-link/Page-Up state where real content is visible above the seam.

After the reclaim the section is plain static layout: no pin, no spacer, no
gap, video playing through all of it.

---

## The fourteen bugs

These are written down in the order we hit them. The bug names use the
implementation we found them in (the demo pattern), but Bugs 2, 5, 6 apply to
the hero pattern as well.

> **Reading order matters for 3 → 4 → 6 → 7.** Each "fix" in that chain
> patched the previous symptom; Bug 7 is where we learned the whole
> pin-teardown approach is unfixable and replaced it with sticky positioning
> (B.2). Bugs 3, 4, 6 are kept for the record — in the sticky architecture
> they can't occur, because there is no pin to kill, disable, or revert.
>
> **The same goes for 12 → 13 → 14.** That chain is the post-handoff story:
> the symmetric zone was wrong UX (12), retiring the pin fixed it but exposed
> sticky re-pinning (13), retiring sticky fixed *that* but left a gap (14).
> Each fix was correct and necessary; the lesson is that "scrub hands off to
> playback" isn't one feature, it's three — ownership (B.3), pin retirement
> (B.4), and travel reclaim (B.5) — and shipping any subset feels broken on a
> real phone.
>
> **And 9, 10, 11 are the iOS triptych.** Two of them (10, 11) produce the
> *identical* user-visible symptom — frozen scrub, black flash, plays from 0
> — through unrelated mechanisms. Fixing one and re-testing showed "no
> change," which falsely suggested the fix was wrong. It wasn't; both were
> real. When a fix that measured correct doesn't change the symptom, look for
> a second root cause before reverting.

### Bug 1 — Frames stutter during scrub *(demo pattern only)*

**Symptom:** Video frames "jump around" as you scroll, even though scroll
itself is smooth.

**Cause:** Sparse keyframes. `video.currentTime = x` snaps to the nearest
keyframe; the decoder doesn't deliver in-between frames fast enough.

**Fix:** All-keyframes encoding (Pattern B step 1).

**How to spot it next time:** Frame stutter that survives a smooth-scroll
trackpad and survives `scrub: 0`. If the timeline progress is smooth but the
video isn't, the file is the problem, not GSAP.

**Why the hero pattern doesn't hit this:** `scrub: 0.5` smoothing means the
timeline is constantly interpolating across ~500ms of progress, so the
snap-to-keyframe visually averages out. Tight smoothing exposes it; heavy
smoothing hides it.

### Bug 2 — Page jitters under the pinned element

**Symptom:** Every scroll tick, the pinned element briefly scrolls then snaps
back. Looks like the whole frame is vibrating.

**Cause:** Default `pinType: "transform"`. Browser scrolls natively in one
frame; JS counter-translates the next. The browser scroll is visible in the
gap.

**Fix:** `pinType: "fixed"`. The element is out of flow; the browser never
scrolls it.

**Caveat:** Won't work inside a transformed ancestor. Verify first.

### Bug 3 — Scroll teleports to the bottom of the page

*(demo pattern only)*

**Symptom:** Reach the end of the scrub and the page snaps to the bottom of
the document (often the footer), skipping everything in between.

**Cause:** `onLeave` called `self.kill()`. Kill removes the pin spacer
mid-scroll. The document instantly shrinks by `scrubPx`. If the user's scroll
position now exceeds the new `maxScroll` (because the scrubbed section is near
the bottom of the page), the browser clamps to the new max → footer.

**Initial wrong fix:** `self.disable(false)` — keeps the spacer, just stops
the trigger updating. No document height change, no clamp, no teleport. **But
this hides Bug 4.**

### Bug 4 — Gap appears *above* the video after scrubbing past it

*(demo pattern only)*

**Symptom:** After scrubbing through the video, you scroll further down, then
back up. You see ~`scrubPx` of empty space between the previous section and
the video. The video sits at the bottom of where the spacer used to be.

**Cause:** When scrub completes (`clipped === 1`), ScrollTrigger applies
`transform: translateY(${pinChange}px)` to the pin element (line 1139 of
`ScrollTrigger.js`). This is GSAP's *visual-continuity* logic — it visually
"sticks" the element in place when the pin disengages, so the element doesn't
snap upward as the spacer un-spaces.

If you used `disable(false)` to fix Bug 3, that 800px translate is **locked in
forever**. The spacer still has its `padding-bottom` *and* the element inside
it is translated 800px down. Scrolling back up reveals the spacer's empty top.

**Fix:** In `onLeave`, *do* revert the pin (clears the transform and removes
the spacer) **and** immediately scroll-compensate so the element stays in the
same visual position:

```ts
onLeave: (self) => {
  const pin = self.pin as HTMLElement | undefined;
  self.disable(true);                                     // revert: spacer removed, transform cleared
  if (pin) {
    const offset = pin.getBoundingClientRect().top;       // where the element ended up
    if (offset) window.scrollBy(0, offset);               // reanchor to viewport top
  }
}
```

`pin.getBoundingClientRect().top` after the revert is roughly `-scrubPx` (the
element is now above viewport top because the document shrunk). `scrollBy`
in the same JS tick re-anchors it — no paint between the two operations, so
the user sees no jump. This fixes Bug 3 *and* Bug 4 in one move.

### Bug 5 — `anticipatePin > 1` causes a slow-scroll upward jump

**Symptom (initially perceived):** Slow scroll is smooth, fast scroll "swings"
the element into place. The tempting fix is to bump `anticipatePin`.

**Reality:** Bumping `anticipatePin` to `2` or higher introduces a *worse*
bug — on slow scroll the pin engages ~50–100px before the trigger crosses
viewport top, so the element visibly jumps **up** to `position: fixed; top: 0`
when the user was just looking at it 50–100px lower. You traded a smooth
problem for a jerky one.

**Keep `anticipatePin: 1`.** The fast-scroll "swing" isn't the pin — it's the
scrub-smoothing tween catching up to the new scroll position. That swing is
the natural character of a scrub-controlled video and reads as intentional.

**Knobs for taste:**

- Want a tighter feel on fast scroll? Lower `scrub` (e.g. 0.3 → 0.2).
- Want a glide-ier feel? Raise `scrub` (e.g. 0.3 → 0.5).
- **Don't** touch `anticipatePin`.

**The trade-off, stated plainly:** scrub smoothing trades positional tightness
for visual smoothness. There is no value of `scrub` that's perfect at both
ends of the speed spectrum. Pick a balance point and live with it.

### Bug 6 — Video resets to frame 1 after scrub completes

*(demo pattern only)*

**Symptom:** Scrub completes, `onLeave` fires, video starts playing — but from
the *beginning* of the clip, not from the scrub-end frame.

**Cause:** `self.disable(true)` calls `revert(true, true)` (line 1853 of
`ScrollTrigger.js`), which calls `update(true)` (line 1277). With `reset=true`,
line 1649 sets `p = 0 → clipped = 0`, then line 1715 calls
`animation.totalProgress(0)`. That rewinds the `to(video, { currentTime:
scrubDuration })` tween → `video.currentTime = 0`.

We need `disable(true)` for the pin teardown (Bug 4), but the side-effect of
rewinding our `currentTime` tween is unwanted.

**Fix:** Capture `video.currentTime` before disable, restore after. Both calls
run synchronously in the same JS tick — no paint between them, so the playhead
visibly stays put:

```ts
onLeave: (self) => {
  startPlayback();
  const pin = self.pin as HTMLElement | undefined;
  const savedTime = video.currentTime;
  self.disable(true);
  if (Number.isFinite(savedTime) && savedTime > 0) {
    video.currentTime = savedTime;
  }
  if (pin) {
    const offset = pin.getBoundingClientRect().top;
    if (offset) window.scrollBy(0, offset);
  }
}
```

**Why not `disable(true, true)` (the `allowAnimation` flag)?** That flag only
controls whether the *scrub smoothing tween* is paused. It does not prevent
`update(true)` from rewinding the user-supplied timeline. Save/restore is the
only reliable workaround short of forking ScrollTrigger.

### Bug 7 — The handoff itself jumps (and the teardown can't be fixed)

*(demo pattern only — this is the bug that killed `pin: true` for Pattern B)*

**Symptom:** At the scrub→playback handoff the page visibly jumps — and
*differently per browser*. Desktop Chrome yanks **up** to the video; iOS
Safari jerks **down** toward the next section and then fights the user's
momentum scrolling. The inconsistency across browsers is the tell: you're not
looking at a layout bug, you're looking at two scroll engines reacting to the
same mid-scroll document mutation.

**Cause:** The Bug 3/4/6 teardown (`disable(true)` + `scrollBy`) removes the
pin-spacer at the seam — the document shrinks by `scrubPx` **while the user is
scrolling**. The compensating `scrollBy` then fights Chrome's scroll anchoring
on desktop and live momentum on iOS. Headless probes measured the document
losing exactly `scrubPx` (800/500) with `scrollY` yanked −795/−496 at the
seam.

**Things that don't fix it:** deferring the teardown until scroll "settles"
(`scrollend` fires early on discrete scrolls, so it still lands mid-scroll;
and once the user *has* settled past the seam, the re-anchor target — "demo
at viewport top" — is simply wrong and drags them back). The correct
`scrollBy` value depends on where the user is *and* whether momentum is live —
information you can't reliably have. **Any architecture that reclaims the
travel height *at the seam* needs that correction; therefore no such
architecture can work.** (Reclaiming it *later*, anchored so nothing visible
can move — at finger-down, on the first turn-back, or once everything is
offscreen — is a different story — see Bug 14 / B.5. The unfixable part is
specifically "document height changes under opposing live momentum with real
content moving on screen.")

**Fix:** Make the travel height *permanent layout* so nothing is reclaimed at
the seam: `position: sticky` + a real spacer child (see B.2). Constant
document height ⇒ no correction ⇒ nothing to jump. This also fixes a latent
cousin bug: the pin-spacer used to be created late (after video metadata +
fonts), shifting everything below the demo by `scrubPx` *after* first paint.

### Bug 8 — Sticky travel as wrapper padding: the block never sticks

*(demo pattern only)*

**Symptom:** `position: sticky` computes correctly, the wrapper is `scrubPx`
taller via `padding-bottom`, ScrollTrigger scrubs the video — but the block
scrolls straight through the zone without ever pinning.

**Cause:** A sticky element is constrained to its containing block, which is
the parent's **content box**. Padding sits outside the content box, so a
padding-based travel gives the block exactly zero room to move — sticky is
honoured, with nowhere to go. Silent: no warning, no error, computed styles
all look right.

**Fix:** The travel must be **real content** — a spacer child after the
sticky block (`<div aria-hidden style="height: var(--scrub-travel)">`), or
equivalently a `::after` with explicit height. Verified by live-DOM probe:
padding → `demoTop: -400` mid-zone (not stuck); spacer → `demoTop: 0`
(stuck).

### Bug 9 — An ad-hoc re-encode silently lost the keyframe flags

*(demo pattern only)*

**Symptom:** Scrub feels laggy / frames freeze on mobile, on a file that used
to scrub fine.

**Cause:** A quick "refresh the 720p cut" re-encode was run as a one-off
terminal command without the `-g 6 -keyint_min 6` flags. x264's default GOP
is 250 — at 60fps that's one keyframe every ~4.17 seconds, i.e. **one
keyframe in the entire 2s scrub window**. Every seek decodes up to 250
frames. Nothing warns you; the file plays normally — it only scrubs badly.

**Fix:** Re-encode with the dense-keyframe flags (B.1) — and put **every
shipped encode in a checked-in script** (`scripts/encode-video.sh` here) so
the flags physically cannot be lost in a re-encode. The flags lived only in
shell history; that's how they got lost.

**How to spot it next time:**

```bash
ffprobe -v error -select_streams v:0 -skip_frame nokey \
  -show_entries frame=pts_time -of csv=p=0 file.mp4 | head
```

Healthy: `0.0, 0.1, 0.2, …`. Broken: `0.0, 4.17, 8.33, …`. Run this on every
scrub video before shipping it.

### Bug 10 — The ScrollTrigger zone goes stale: the document breathes during load

*(any mid-page trigger; surfaced by the sticky demo on real iOS)*

**Symptom:** Real iOS only: the video is frozen on frame 0 through the whole
scrub zone, then goes black ~1s, then plays the lid-open as a normal video.
Desktop engines (Chromium *and* desktop WebKit probes) cannot reproduce.

**Cause (measured live on the iOS Simulator):** Media elements without
reserved boxes (`w-full h-auto`, no CSS `aspect-ratio`) render at the
replaced-element default **2:1** until intrinsic size arrives, then spring
back — the document height *breathes* (±177px measured) during load.
ScrollTrigger computes `start`/`end` at creation/refresh and only
auto-recomputes on resize/load — a trigger created mid-dip keeps stale
geometry **forever** (measured Δ=177px persisting 67+ seconds). CSS sticky
pins at TRUE geometry while the scrub fires at BELIEVED geometry, so the
user scrolls the real sticky zone with the trigger inactive, then crosses the
stale zone below it → `onLeave` → `play()` from ~0.

**Why `pin: true` masked this for months:** GSAP pins the block at the
trigger's *own believed* start, so pin and scrub desync *together* —
invisibly. Switching to CSS sticky is what split them. The stale zone was
always there.

**Secondary factor:** gating trigger creation on `loadedmetadata` (see
foundation §4) delays zone registration on slow networks until the user is
already inside it — same frozen-scrub symptom by a second path.

**Fix (layered):**

1. Reserve every flow-affecting media box up front: CSS `aspect-ratio` on
   every `<video>`/`<img>` that sizes by width. The document must not change
   height when media decodes.
2. Create mid-page triggers at mount; never gate on the network (§4).
3. Defense-in-depth: a `ResizeObserver` on `body` → debounced
   `ScrollTrigger.refresh()` whenever document height changes after triggers
   exist. (Scrolling never changes docH, so this can't fire mid-scrub.)

**How to spot it next time:** Log the live trigger's `.start` against the
element's real absolute Y (`element.getBoundingClientRect().top +
window.scrollY`) after load settles. They must match. If a scrub is "frozen"
on one device class only, suspect stale geometry before suspecting the
media pipeline.

### Bug 11 — iOS ignores `preload="auto"`: the zone scrubs an empty buffer

*(demo pattern only; produces the SAME symptom as Bug 10 independently)*

**Symptom:** Identical to Bug 10 — frozen poster through the zone, ~1s black,
then plays from 0. This is the bug that made the Bug 10 fix look wrong:
"it hasn't changed at all" on re-test, because this second cause was still
live.

**Cause (measured on a deployed build, cold cache):** iOS Safari treats
`preload="auto"` as a hint and fetches **zero media data** — the video sat at
`readyState 1, buffered end 0` in the zone. The `currentTime` writes all
landed (the scrub was *working*), but iOS had nothing to decode, so it
painted the poster/black throughout. At handoff, `play()` issued the first
real fetch → ~1s of black → playback from ~0. A "warm the preload attribute
metadata→auto as the user approaches" strategy is a **no-op on iOS** — it
only ever worked via the HTTP disk cache from earlier visits, which is why it
passed every warm-cache test.

**Fix — the "warm kiss":** a muted `playsInline` video may `play()`
programmatically on iOS, and a real play opens the real fetch+decode
pipeline. In the approach-warming IntersectionObserver (~1.5 viewports out):

```ts
video.dataset.warming = "1";
video.play().then(() => {
  delete video.dataset.warming;
  if (video.dataset.handedOff) return;   // real playback started meanwhile — leave it
  video.pause();
  if (!video.dataset.inZone) video.currentTime = 0;  // rest on the poster frame
}).catch(() => { delete video.dataset.warming; });   // Low Power Mode → degrade
```

Three guards, all earned by real failures:

- `data-warming` — play-listeners (caption rise-off, ownership flag) must
  ignore the kiss's fake `play` event.
- `data-handedOff` — on a slow network + fast scroll the kiss can resolve
  *after* the real handoff; pausing then would freeze the demo right as it
  starts.
- `data-inZone` (set/cleared in the trigger's `onToggle`) — the kiss's
  seek-to-0 must not snap the lid shut under a user already scrubbing.

Verified: buffered 0 → entire file buffered *before* the zone, lid scrubs
open with painted frames matching `currentTime`.

### Bug 12 — The symmetric zone re-takes the playhead after real playback

*(demo pattern only — first of the post-handoff chain 12 → 13 → 14)*

**Symptom (real iPhone):** After the demo has handed off and is playing,
scrolling back up (a) re-scrubs the playing video *in reverse* — the lid
closes over a demo the user is watching; (b) slides the caption back down
over the open screen; (c) the `onEnterBack` pause freezes the demo on an
open-lid frame with **no path to `ended`** — iOS momentum naturally rests
just inside the zone end, so this happened constantly.

**Cause:** The first sticky implementation treated the zone as symmetric
after playback (`onEnterBack: { played = false; video.pause(); }` — re-arm
and re-scrub). Correct trigger bookkeeping, defensible on paper ("the scrub
is scroll-driven, scroll went back"), and wrong as UX: once the user has
seen the video play, scroll re-taking the playhead reads as the page
breaking.

**Fix:** One-shot ownership (B.3). `played` never resets; every scroll-driven
writer is a proxy gated on `!played`; the timeline is never killed (that
would kill the trigger's enter/leave bookkeeping — gate the writes instead);
the replay button takes ownership the same way (`play` event listener,
excluding `data-warming`).

**The design rule, stated once:** *scroll-driven control and autonomous
playback need exactly one owner at a time, and the handoff between them is
one-way.* Any state where both can write `currentTime` — or where scroll can
pause what playback started — will be hit by real users within minutes.

### Bug 13 — Sticky re-pins on the way back up; scroll "stops" for the travel distance

*(demo pattern only)*

**Symptom (real iPhone):** Post-playback, scrolling back up: "I'm scrolling
and I'm not moving anywhere for a few scrolls, then suddenly I start moving
up" — the page eats `scrubPx` of scroll re-pinning the block through the
travel zone. (With Bug 12's pause also live, the video froze at the same
moment.)

**Cause:** `position: sticky` is **stateless** — it re-engages every time
the scroll range is re-crossed, in both directions, forever. Gating the
*scrub* on `played` does nothing about the *pin*, which is pure CSS.

**Fix:** Retire the pin at handoff (B.4): swap the block to
`position: relative; top: ${scrubPx}px` — the exact pixel pose sticky holds
at end-of-travel, so the swap is invisible and document height is unchanged.
Sticky can never re-engage. Also remove **every** scroll-driven pause
(`onLeaveBack` pause included): once playing, the video plays; the only
allowed intervention is *resuming* an iOS offscreen suspension (B.3's
IntersectionObserver).

### Bug 14 — The retired pin leaves a `scrubPx` gap above the demo

*(demo pattern only — the final bug of the chain)*

**Symptom:** With the pin retired (Bug 13 fixed), scrolling back up reveals a
huge blank band — `scrubPx` of dead space — between the previous section and
the demo. (Echo of Bug 4, by a different mechanism: there it was a stale GSAP
transform; here it's the consumed travel itself, now serving no purpose.)

**Cause:** The travel spacer's height was consumed by the sticky journey;
after retirement it's just empty document. It must be reclaimed — but Bug 7
proved reclaiming at the seam is unfixable.

**Fix (two iterations):** Deferred reclaim, anchored so nothing visible moves
(B.5). The first iteration collapsed only at a provably-invisible moment —
gap offscreen AND 400ms scroll-quiet, or section fully below the viewport.
That shipped a second report: a user turning back *immediately* after the
handoff outruns the quiet timer, and once the gap is on screen "wait for
invisible" waits forever — they ride the whole gap up and watch it snap at
the far end. The complete fix collapses **the instant the user turns back
toward the gap**, before it can be revealed: on `touchstart` with the gap
at/above the viewport top (finger-down kills iOS momentum, so the same-task
`scrollTo(y - scrubPx)` can't fight it — and on touch, revealing the gap
always starts with a fresh finger-down), and on the first upward scroll
event near the gap (wheel/trackpad deltas are relative and survive the
re-anchor). Quiet-timer and below-the-viewport collapse remain as fallbacks.
Then `ScrollTrigger.refresh()`.

**Three hard-won details:**

- **2px epsilon on both geometry boundaries.** `scrollY` lands on whole
  device pixels; `getBoundingClientRect()` is fractional. A user resting
  exactly at the handoff point measured `rect.top + scrubPx = 0.07px` —
  *never* ≤ 0, so a strict comparison deadlocked the reclaim forever on
  mobile. Any "wait until fully offscreen" geometry check needs a tolerance.
- **"Deferred" must not mean "visible".** A reclaim that politely waits
  while the user stares at the gap has the priorities backwards. The gap
  must be unrevealable, not merely collapsed-when-convenient — and the
  moment the user turns back toward it is both the last chance to collapse
  unseen and a moment when no opposing momentum can be live.
- **The quiet-wait is still load-bearing as a fallback.** The same collapse
  that is invisible at rest is the original Bug 7 jump if it runs under
  opposing live momentum. 400ms with no scroll events worked; `scrollend`
  alone does not (it fires early on discrete scrolls — same finding as
  Bug 7).

---

## Things we tried that didn't work

- **`pinType: "transform"`** (the default) — Bug 2.
- **`self.kill()` in `onLeave` without scroll compensation** — Bug 3.
- **`self.disable(false)` to "keep the spacer"** — Bug 4.
- **`anticipatePin: 2` to "fix fast scroll"** — Bug 5.
- **`disable(true, true)` to "preserve the animation"** — Bug 6 (flag only
  affects scrub tween, not the user timeline).
- **`disable(true)` + `scrollBy` teardown in `onLeave`** — Bug 7. Worked in
  isolation, jumped at the seam in real browsers (Chrome scroll anchoring,
  iOS momentum).
- **Deferring that teardown until scroll settles** — Bug 7. `scrollend` fires
  early on discrete scrolls; and a late re-anchor to "demo at viewport top"
  is the wrong target once the user has settled elsewhere.
- **Keeping the freed band and filling it with decoration** — rejected on
  design: the correct outcome is that the gap doesn't exist, not that it gets
  decorated.
- **Sticky travel via wrapper `padding-bottom`** — Bug 8. Sticky constrains
  to the parent's content box; padding gives zero travel.
- **VP9/WebM all-keyframes** — 56MB for a 25s clip. Not viable.
- **`ScrollTrigger.refresh()` from inside a deferred setup** — races other
  deferred triggers in the same Strict Mode mount; throws "undefined.end".
- **Ad-hoc ffmpeg re-encodes** — Bug 9. The keyframe flags lived in shell
  history and got lost. Script every shipped encode.
- **Gating mid-page trigger creation on `loadedmetadata`** — Bug 10. On slow
  networks the zone registers after the user is already inside it.
- **Warming iOS by flipping `preload` metadata→auto** — Bug 11. iOS ignores
  the attribute; only a real `play()` opens the fetch pipeline.
- **The symmetric re-scrub zone after playback** (`onEnterBack` pause +
  re-arm) — Bug 12. Correct bookkeeping, broken UX: scroll re-took a playing
  video.
- **Pausing the video from any scroll callback post-playback** — Bugs 12/13.
  Strands the demo frozen and visible with no path to `ended`.
- **Leaving `position: sticky` live after the handoff** — Bug 13. Sticky is
  stateless and re-pins on every re-cross; retire it explicitly.
- **Strict (0-tolerance) geometry comparisons for "fully offscreen"** —
  Bug 14. Device-pixel `scrollY` vs fractional rects deadlocked the reclaim
  at 0.07px, forever.

## Don't

- Don't replace scrubbed video with `IntersectionObserver` autoplay if you
  actually want scroll-driven scrubbing. They're different features.
- Don't ship a scrub without a `prefers-reduced-motion` fallback. Turn the
  whole hook off when reduced-motion is set; don't try to "shrink" it.
- Don't put a `pinType: "fixed"` element inside a transformed ancestor — the
  fixed positioning is trapped by the transform's containing block. Either
  restructure the DOM, or accept `pinType: "transform"` and Bug 2's jitter.
- Don't tune `anticipatePin` above 1. That's not the knob you want.
- Don't omit the `played` flag in `startPlayback` — both `onComplete` and
  `onLeave` can fire, so the play call must be idempotent.
- Don't let any scroll callback pause the video once real playback has
  started. The only allowed post-handoff intervention is resuming an iOS
  offscreen suspension.
- Don't change document height under opposing live momentum or with real
  content moving on screen — not at the handoff, not "when scroll settles"
  (settle detection lies; Bug 7). Defer to an invisibly-anchored moment —
  touchstart, first turn-back, fully-below, or scroll-quiet (B.5) — or
  don't do it. And don't let "deferred" mean the user can ever *see* the
  un-reclaimed space while you wait (Bug 14, second report).
- Don't trust warm-cache tests of media buffering. Bug 11 passed every test
  for weeks on the HTTP disk cache. Cold-cache + real device or it isn't
  verified.
- Don't re-encode shipped video outside the checked-in script (Bug 9).
- Don't ship a flow-affecting `<video>`/`<img>` without a reserved
  `aspect-ratio` box if any ScrollTrigger lives below it (Bug 10).

## Real-device test checklist (Pattern B)

Desktop probes pass and the phone still breaks — Bugs 10–14 were ALL found on
a real iPhone after clean desktop runs. Before calling a scrub-then-play
handoff done, run this on a physical device, **cold cache**:

1. Approach slowly → lid closed (poster) at rest, caption readable.
2. Scrub down and **back up** inside the zone → frames track in both
   directions, no black, no poster flash.
3. Scrub through → playback starts at the scrub-end frame, in real time.
4. While it plays, scroll **up** past it — *immediately*, without pausing
   first → scroll moves 1:1 (no dead zone), video keeps playing, caption
   stays off, **no blank band** between the demo and the section above at
   any point on the way up (not even one that closes later).
5. Scroll back down → still playing (or `ended` + replay overlay), never
   frozen mid-frame, scrub never re-takes the playhead.
6. Let it end → replay overlay; replay → plays from 0; repeat step 4.
7. Fast momentum flick through the whole section in both directions → no
   jump, no fight, no freeze.

## Cheat sheet

```
Glide (Pattern A):       pin: true + pinType: "fixed" + anticipatePin: 1
Scrub-then-play (B):     position: sticky + REAL spacer child (not padding) — no pin, no teardown
anticipatePin: 1        — never higher (Pattern A only)
scrub: 0.3 → 0.5        — taste; lower = tight, higher = glide
end: "+=N"              — short for "precise scrub then play", long for "glide"
trigger (Pattern B)     — the travel WRAPPER, never the sticky block
preload: auto/metadata  — desktop/mobile split; iOS ignores both → warm kiss (Bug 11)
Encoding (Pattern B)    — dense keyframes (-g 6), scripted, ffprobe-verified (Bug 9)
Media below a trigger   — reserved aspect-ratio boxes, always (Bug 10)
onLeave (Pattern B)     — startPlayback() and NOTHING else
Ownership (Pattern B)   — ONE-SHOT: played flips once; all scroll writers proxy-gated (B.3)
At handoff (Pattern B)  — retire sticky: relative + top:scrubPx, pixel-identical (B.4)
After handoff (B)       — reclaim travel on turn-back (touchstart / first up-scroll),
                          quiet + below as fallbacks, 2px epsilon (B.5)
```
