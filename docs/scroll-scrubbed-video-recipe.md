# Scroll-scrubbed video recipe

How to drive a `<video>` from scroll position with GSAP ScrollTrigger so it
feels buttery, without falling into the six bugs we hit getting there.

This recipe is written to be portable to any project. The two implementations
that grew this guide are:

- **Hero pattern** — long, heavy-smoothed scrub that bleeds into other timeline
  animations. Optimised for "glide." (`src/components/hero/*` in this repo.)
- **Demo pattern** — short, precise scrub that ends, then the video plays
  normally to its end. Optimised for "exact frames." (`src/components/section-05/MacbookDemo.tsx`
  + `useMacbookScrub.ts` in this repo.)

Both share the same pinning fundamentals. They diverge on encoding, scrub
smoothing, and whether they need an `onLeave` teardown. Decide which one you
want **before** picking values — they trade off against each other.

---

## Quick decision

| You want… | Pattern | Encoding | `scrub` | Scrub distance | onLeave teardown |
|---|---|---|---|---|---|
| Long, glide-y intro that fades into other reveals | **Hero** | Default H.264 (sparse keyframes) | `0.5` | `+=3000`-ish | None |
| Precise frame-by-frame scrub then autoplay | **Demo** | All-keyframes H.264 | `0.3` | `+=500–800` | Yes (see Bugs 3, 4, 6) |

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
  bill low while still giving you `video.duration` immediately.
- Always ship a poster — it's what users see while the video buffers and
  during `prefers-reduced-motion`.

### 2. `pinType: "fixed"` (critical)

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

### 4. Wait for `loadedmetadata` before creating the trigger

`video.duration` is `NaN` until metadata loads. If you create a tween targeting
`currentTime: video.duration` before then, the target value is `NaN` and the
scrub silently does nothing.

```ts
const setup = () => { /* create timeline + trigger here */ };

if (video.readyState >= 1 && Number.isFinite(video.duration)) {
  setup();
} else {
  video.addEventListener("loadedmetadata", setup, { once: true });
}
```

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

### B.1 — Encoding: all-keyframes H.264

For pattern B, encode every frame as a keyframe. The user is in tight
positional control of the playhead during scrub, and you don't have the
heavy smoothing to mask snap-to-keyframe seeks.

```bash
ffmpeg -y -i source.mov \
  -c:v libx264 -preset slow -crf 28 \
  -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart \
  -vf "scale=1920:-2" -an demo.mp4
```

- `-g 1 -keyint_min 1` → keyframe every frame.
- `-sc_threshold 0` → disable scene-change keyframe insertion (redundant).
- `-movflags +faststart` → moov atom at front so playback can start before the
  full file downloads.

**Size impact:** roughly doubles vs. default H.264 (in our case 10MB → 19MB
for a 25s clip). Acceptable.

**Don't try WebM/VP9 all-keyframes** — same clip ballooned to 56MB. H.264 is
the right format here.

Provide a 720p variant for mobile (`-vf "scale=1280:-2"`, CRF 30) and an MP4
poster image.

### B.2 — Trigger config

```ts
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: blockRef.current,
    start: "top top",
    end: `+=${scrubPx}`,    // 800 desktop / 500 mobile worked well
    scrub: 0.3,             // tight smoothing — frames track scroll closely
    pin: true,
    pinSpacing: true,
    pinType: "fixed",
    anticipatePin: 1,
    onLeave: (self) => {
      startPlayback();
      // See bugs #4 + #6 below.
      const pin = self.pin as HTMLElement | undefined;
      const savedTime = video.currentTime;
      self.disable(true);                                  // revert pin + clear transform
      if (Number.isFinite(savedTime) && savedTime > 0) {
        video.currentTime = savedTime;                     // bug #6: undo timeline rewind
      }
      if (pin) {
        const offset = pin.getBoundingClientRect().top;    // bug #4: compensate document shrink
        if (offset) window.scrollBy(0, offset);
      }
    },
  },
});

tl.to(video, {
  currentTime: scrubDuration,    // partial duration — leave room to "play out"
  ease: "none",
  duration: 1,
  onComplete: startPlayback,     // fires if user scrolls to end smoothly
});
```

Notes:

- **Two ways `startPlayback` can fire** — `onComplete` (smooth scroll to end)
  and `onLeave` (fast scroll past end). Idempotency-guard with a `played` flag
  so calling it twice is harmless.
- **`scrubDuration` should be < `video.duration`.** The "play normally" phase
  needs frames left over to play. `Math.min(2, video.duration || 2)` works
  well — first 2 seconds are scrub-controlled, the rest plays out.
- **`scrub: 0.3` not `0.5`.** This pattern needs tighter tracking so the
  scrubbed frame matches the scroll position closely. The hero's `0.5`
  smoothing would feel sluggish here.

---

## The six bugs

These are written down in the order we hit them. The bug names use the
implementation we found them in (the demo pattern), but Bugs 2, 5, 6 apply to
the hero pattern as well.

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

---

## Things we tried that didn't work

- **`pinType: "transform"`** (the default) — Bug 2.
- **`self.kill()` in `onLeave` without scroll compensation** — Bug 3.
- **`self.disable(false)` to "keep the spacer"** — Bug 4.
- **`anticipatePin: 2` to "fix fast scroll"** — Bug 5.
- **`disable(true, true)` to "preserve the animation"** — Bug 6 (flag only
  affects scrub tween, not the user timeline).
- **VP9/WebM all-keyframes** — 56MB for a 25s clip. Not viable.
- **`ScrollTrigger.refresh()` from inside a deferred setup** — races other
  deferred triggers in the same Strict Mode mount; throws "undefined.end".

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

## Cheat sheet

```
pinType: "fixed"        — always (when ancestors allow)
anticipatePin: 1        — always; never higher
scrub: 0.3 → 0.5        — taste; lower = tight, higher = glide
end: "+=N"              — short for "precise scrub then play", long for "glide"
preload: auto/metadata  — desktop/mobile split
All-keyframes encoding  — only for the precise pattern; sparse fine for glide
onLeave teardown        — only when scrub ends inside the document (not at end of page)
```
