# §05 iOS scrub regression — TWO ROOT CAUSES FOUND + FIXED (2026-06-10)

**Status 2026-06-10: BOTH root causes measured on the iOS Simulator and fixed
on `fix/section-05-ios-scrub`. Full correct sequence verified frame-by-frame
on the deployed preview build with a cold cache. Awaiting Dan's real-iPhone
verification.** An earlier draft of this doc blamed the sparse-keyframe 720p
encode; Dan's testimony + git ancestry demoted that to a pre-existing
aggravator (see "Keyframe defect" below — re-encoded as part of this fix, but
it is NOT what changed).

This bug needed TWO fixes. Root cause #1 (stale ScrollTrigger zone) was found
first; Dan re-tested the preview on his iPhone and reported the same symptom
("it hasn't changed at all"). A second instrumented run on the preview build
then caught root cause #2 live. Both were real; #1 alone was insufficient
because #2 independently produces the identical user-visible symptom.

## ROOT CAUSE #2 — iOS ignores `preload="auto"`; video had zero media data in the zone

Measured on the deployed preview build (Simulator, cold cache, HUD with
`bufEnd`): the video reached the scrub zone at **readyState 1 (HAVE_METADATA),
buffered end 0** — iOS Safari fetches **no media data** for `preload="auto"`;
the attribute is treated as a hint and ignored. The warming
IntersectionObserver (flip `preload` metadata→auto at ~1.5 viewports out) has
therefore always been a no-op on iOS.

Consequence: every scrub seek landed in an empty buffer (`currentTime` writes
landed — HUD showed vt advancing 0.128→1.993 with zone Δ:0 — but iOS painted
the poster/black, having nothing to decode). At handoff, `play()` issued the
FIRST real media fetch → ~1s of black → playback from ~0. Exactly Dan's
symptom, with the geometry fix already in place and working.

Why it ever worked for Dan pre-sticky: HTTP disk cache from earlier visits —
the warming logic is identical pre/post sticky per git history, so a cached
file masked the dead `preload` flip.

**Fix — the "warm kiss"** (`MacbookDemo.tsx`): a muted playsInline video may
play programmatically on iOS, so the warming callback now does
`play().then(pause)` — this opens the real fetch+decode pipeline. Then
`currentTime = 0` so the rest state matches the poster (the kiss otherwise
leaves a cracked-open lid). `video.dataset.warming` marks the element so the
scrub hook's desktop play-listener (caption rise-off) ignores the kiss.
Guarded to the at-rest state (`paused && currentTime < 0.1`); if `play()` is
refused (Low Power Mode) it degrades to the old poster-through-the-zone.

Verified (run 4, deployed build, cold cache): buf 0 → **25.22 (entire file)
before the zone**, closed lid at rest on approach, lid visibly scrubs open
in-zone with painted frames matching vt, handoff plays in real time.

## ROOT CAUSE #1 (measured, not theorized)

The lead hypothesis below ("zone desync") was correct, and the instrumented
Simulator run caught the mechanism live:

1. **Unreserved video boxes make the document breathe during load.** The hero
   mobile `<video w-full h-auto>` (720×720 cut + poster) had no CSS
   aspect-ratio, so whenever intrinsic-size info wasn't available it rendered
   at the replaced-element default **2:1**, then sprang back on decode —
   **±177px** of document height at 342px width. §03's video (cuts ≈2.38:1)
   contributed −32px the same way.
2. **ScrollTrigger zones go stale.** start/end are computed at creation/refresh
   and only auto-recompute on resize/load. Measured: §05's trigger was created
   mid-dip at `start=3867`; the hero box then grew back; the true sticky travel
   sat at `4044`. **Δ=177px persisted 67+ seconds — it never healed.**
3. **Why pin:true was immune with identical GSAP config:** GSAP pins the block
   at the trigger's OWN believed start, so pin and scrub desync *together* —
   invisible. CSS sticky pins at TRUE geometry, splitting them: the user
   scrolls the real sticky zone with the trigger inactive (video frozen),
   crosses the stale zone below it → `onLeave` → `play()` from ~0 with a ~1s
   black gap (nothing ever seeked, so zero buffered data).
4. **Secondary factor:** the scrub setup was gated on video `loadedmetadata`
   (only to read duration). On a slow production network that delays trigger
   creation until the user may already be inside/past the zone — the same
   frozen-scrub symptom by a second path.

## Fix package (all on `fix/section-05-ios-scrub`)

- `src/components/section-05/MacbookDemo.tsx` — the warm kiss (root cause
  #2): warming IO callback does `play()→pause()→currentTime=0` with a
  `data-warming` marker, instead of relying on the dead `preload` flip.
- `src/components/section-05/useMacbookScrub.ts` — desktop play-listener
  ignores the kiss (`if (video.dataset.warming) return`).
- `src/components/hero/HeroVideo.tsx` — `aspect-square` on the mobile video:
  box reserved before poster/metadata decode. (Desktop sizes by height inside
  an absolute container — no flow impact, untouched.)
- `src/components/section-03/LibraryVideo.tsx` — `aspect-[1920/808]` /
  `aspect-[1024/430]` per variant, same reservation.
- `src/components/section-05/useMacbookScrub.ts` — metadata gate removed; the
  trigger now exists from mount (`duration` falls back to the 2s clamp).
- `src/lib/scrollTrigger.ts` — defense-in-depth: ResizeObserver on `body` →
  debounced `ScrollTrigger.refresh()` on any document-height change after
  triggers exist. Scrolling never changes docH, so it can't fire mid-scrub.
- `public/videos/macbook-demo-720.mp4` — re-encoded with dense keyframes
  (`-g 6`, 0.1s cadence; was GOP-250/~4.17s). 3.8MB.
- `src/components/dev/ScrubHud.tsx` (+ mount in `page.tsx`) — diagnostic
  recorder, inert unless `?scrubhud=1`; kept in-branch so the preview deploy
  can be instrumented on-device.

## Verification so far

- Simulator (iPhone 17 Pro, iOS Safari engine): zero layout shifts post-fix,
  trigger Δ=0 from creation, scrub advances 0.002→1.813 with `demoTop=0`,
  handoff plays, deep-restore + re-entry re-arm correct.
- **Run 4 (deployed preview build b17c804, cold cache, frame-by-frame):**
  cold at glide start (rs:1 buf:0) → warm kiss completes pre-zone (rs:4
  buf:25.22, vt:0 paused — full file buffered, resting on frame 0) → closed
  lid at rest on approach → lid scrubs open in-zone (painted frames match
  vt:0.227→1.194, ACTIVE, Δ:0) → unsticks past end, PLAYING, vt advancing
  in real time. The complete correct sequence.
- Playwright WebKit desktop + mobile: PASS. Chromium desktop + mobile: PASS.
- vitest 27/27 PASS · lint clean · production build PASS.
- **Outstanding: Dan's real iPhone on the preview deploy — the only true
  confirmation.**

---

*Original diagnosis state below, kept for the record.*

## Symptom (Dan, real iPhone, production @ df46ada)

§05 MacBook demo on iOS Safari: (a) video frozen on first frame through the
whole scrub zone while scrolling, (b) goes completely blank/black ~1s,
(c) then plays the lid-open — "what should be the scrubbed part" — as a
normal video. Desktop browser fine at all viewport sizes.

**Dan's key testimony:** before the sticky fix, on the same iPhone, the scrub
WAS live ("it was scrubbing fine, it was just doing the jerk" at handoff).

## Hard facts (verified)

| thing | pre-fix (68f259c, pinned) | post-fix (df46ada, sticky) |
|---|---|---|
| mobile video file | `macbook-demo-720.mp4` @ 829df6b | **same file, unchanged** |
| scrub tween | `tl.to(video,{currentTime, ease:"power1.in", duration:1})`, `scrub:0.3` | **identical** |
| poster / muted / playsInline / preload warming | present | **identical** |
| pinning | GSAP `pin:true, pinType:"fixed", anticipatePin:1`, trigger=block | CSS `position:sticky` + spacer, trigger=travel wrapper, no pin |
| onLeave | play + deferred teardown (disable/revert/scrollBy re-anchor) | play only, nothing torn down |

- 829df6b (Jun 4, the sparse re-encode) **is an ancestor of 68f259c** — the
  sparse file was in the build where Dan saw a live iOS scrub.
- Desktop Chromium + desktop WebKit (Playwright webkit-2287) probes both PASS
  on the sticky build: sticky engages, currentTime advances, seeks complete in
  ~2–25ms, playback at handoff. **Desktop engines cannot reproduce** — the
  failure needs real-iOS touch/compositor scrolling and the real device media
  pipeline.

## Hypothesis space — NARROWED 2026-06-10

**Discriminator #1 ANSWERED by Dan: "I watched it swing open."** Playback
started from ~0 → H-A (writes-land-paint-starves) is DEAD. The currentTime
writes were never issued while the user was inside the sticky zone. That also
explains the ~1s black at handoff: nothing ever seeked the video, so it had
zero buffered data (iOS ignores `preload="auto"`) until `play()` forced the
first fetch+decode.

**Lead hypothesis: zone desync — the trigger's believed [start, start+500]
doesn't match the real sticky zone on real iOS.** The user scrolls the true
sticky travel with the trigger inactive (no writes), then the trigger zone is
crossed (or fires late at scroll settle) below it → onLeave → play() from 0.
Why the pinned build was immune with identical GSAP config: GSAP `pin:true`
pins the block at the trigger's OWN believed start, so pin + scrub desync
together — invisible. CSS sticky pins at TRUE geometry; GSAP scrubs at
believed geometry; only the sticky build can split them. Desktop is immune
because believed == true there (probes confirm alignment).

What it does NOT yet explain: WHAT makes believed ≠ true on iOS. `start:
"top top"`/`end: "+=500"` don't depend on innerHeight, so URL-bar collapse
alone is insufficient — there must be a real post-refresh layout shift (or a
mis-resolved refresh) to find. Measure, don't theorize: the simulator
experiment must log the live trigger's `.start`/`.end` (find it via
`ScrollTrigger.getAll()` matching the travel element), the travel's live
absolute Y, scrollY, `trigger.isActive`, and video currentTime/readyState/
events through a real touch scroll. Secondary suspects if geometry matches:
scroll-event/ticker starvation during iOS touch scroll (would show as
isActive=true but no writes), or setup/refresh ordering.

**Discriminator #2: instrumented run on the iOS Simulator** (available:
iPhone 17 Pro et al via `xcrun simctl`; Simulator Safari reaches the Mac's
`localhost:3000` directly). Plan:
1. Dev-only recorder gated behind `?scrubhud=1`: rAF loop buffering
   `{t, scrollY, demoTop, video.currentTime, readyState, paused}` + video
   events, POSTed (`fetch keepalive`/`sendBeacon`) every ~500ms to a tiny
   sink server on another port (don't add an app API route). Plus a visible
   `position:fixed` HUD (outside the sticky subtree) for screen-recording runs.
2. Boot simulator, `xcrun simctl openurl booted "http://localhost:3000/?scrubhud=1"`.
3. Drive REAL touch scrolling by synthesizing mouse drags over the Simulator
   window (CGEventPost via python3/pyobjc, or `cliclick dd:/dm:/du:` if
   installed) — programmatic `scrollTo` would bypass the compositor touch
   path under suspicion. Capture with `xcrun simctl io booted recordVideo`.
4. Read the beacon log: did currentTime advance during the zone? Did demoTop
   hold at 0 (sticky engaged)? Where did playback start?
5. Same HUD works for a real-iPhone check via preview deploy (git push =
   preview URL) if the Simulator doesn't reproduce.

## Fix directions (pick AFTER discrimination)

- If **H-A** (paint/seek starvation): re-encode with dense keyframes (below) so
  seeks complete inside one scroll commit — possibly sufficient on its own
  (the Jun 1 all-intra file scrubbed fine on iOS); consider compositor nudges
  (`will-change`/`translateZ(0)` on the video) only with evidence.
- If **H-B** (updates starved): `ScrollTrigger.normalizeScroll(true)` on touch
  devices (GSAP's own iOS remedy — test carefully, it hijacks native scroll
  and may affect the hero + other triggers), or drive the scrub from raw
  scroll events.
- **Do NOT revert to the pin architecture** without exhausting the above — the
  teardown handoff jump (recipe Bug 7) is unfixable by timing; reverting
  trades a broken scrub for a broken handoff. If forced to choose
  short-term, discuss with Dan first.

## Keyframe defect (real, pre-existing, fix regardless — but NOT the trigger)

`public/videos/macbook-demo-720.mp4` (829df6b, Jun 4 "refresh 720p cut",
1.6MB) has keyframes every ~4.17s (x264 default GOP 250 @ 60fps) — one
keyframe in the whole 0–2s scrub window. The Jun 1 cut (e6ebd15, 8.9MB) was
all-intra (keyframe every frame); the desktop file has 0.1s keyframes (`-g 6`,
same flags `scripts/encode-video.sh` uses "for smooth backward scrub").
Sparse GOP = iOS seeks need ~60–250-frame decodes → at best a laggy scrub
(this is the "small-viewport lag" in the original Jun 8 bug report). Re-encode:

```bash
ffmpeg -y -i assets-source/macbook-video-5.mov \
  -vf "scale=-2:720" \
  -vcodec libx264 -crf 26 -preset slow \
  -g 6 -keyint_min 6 -sc_threshold 0 \
  -movflags +faststart -an \
  public/videos/macbook-demo-720.mp4
```

Verify: `ffprobe -v error -select_streams v:0 -skip_frame nokey -show_entries
frame=pts_time -of csv=p=0 public/videos/macbook-demo-720.mp4 | head` → 0.0,
0.1, 0.2… Expect a few MB (acceptable; §05 has deferred buffering). Add the
demo encodes to `scripts/encode-video.sh` (they were ad-hoc, which is how the
flags got lost) + recipe Bug 9: scrubbed video must ship dense keyframes.

## Constraints / housekeeping

- Branch for any fix (`fix/section-05-ios-…`); never commit to main.
- `src/components/JsonLd.tsx` has unrelated uncommitted WIP (merchant schema
  fields) — keep it out of commits.
- Prod deploys: manual `vercel --prod --yes`; verify `curl -sL
  https://vanta.supply`. Real-iPhone verification by Dan is the only true
  confirmation.
- Sticky architecture itself is sound on desktop engines (probes PASS, GSAP
  forum recommends scrub-without-pin + sticky for iOS) — the answer is likely
  an iOS-specific interaction, not a wholesale rework.
