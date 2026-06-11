"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { deferGsap } from "@/lib/scrollTrigger";
import { SCRUB_PX } from "./scrubConfig";

type Args = {
  // The travel wrapper — `scrubPx` taller than the block (motion-safe spacer
  // child rendered by MacbookDemo). It is the scrub trigger.
  travelRef: RefObject<HTMLDivElement | null>;
  // The sticky demo block inside the wrapper (caption + video frame).
  blockRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  variant: "desktop" | "mobile";
  enabled: boolean;
  onScrubComplete?: () => void;
  // Fired when the user scrolls back up into the scrub zone BEFORE real
  // playback has started (post-handoff the demo is fixed and this never
  // fires) — the scrub re-takes the playhead, so the replay overlay must
  // hide if anything showed it.
  onScrubReenter?: () => void;
};

// §05 scrub architecture — constant document height, CSS-native pinning.
//
// The demo block is `position: sticky; top: 0` inside a wrapper that is
// exactly `scrubPx` taller than it, so the block pins at the viewport top and
// travels `scrubPx` of scroll natively — no GSAP pin, no pin-spacer. The
// ScrollTrigger here only maps that scroll range onto video.currentTime
// (scrub) and the caption rise-off.
//
// Why not `pin: true`: pinSpacing reserves scrubPx of document height that the
// old onLeave teardown then removed at the scrub→playback handoff
// (disable(true) + scrollBy re-anchor). That height change at the seam needed
// a scroll correction whose right value depends on where the user has settled
// and whether momentum is live — it fought Chrome's scroll anchoring on
// desktop and iOS momentum on mobile (the "jump at the handoff"). Keeping the
// travel as real, permanent layout means nothing is ever reclaimed: no height
// change, no correction, nothing to jump. Sticky's stick/unstick is
// compositor-driven, so it also can't lag a momentum flick the way a JS-timed
// position swap can. See docs/scroll-scrubbed-video-recipe.md.
//
// The scrub is ONE-SHOT. Before the handoff the zone is freely scrubbable in
// both directions (the lid follows the scroll). The moment real playback
// starts — handoff or the replay button — the demo is done with scroll for
// good: no scroll position ever re-takes the playhead, moves the caption, or
// pauses the video again (the prod "reverse scrub out of nowhere" and "page
// stops scrolling on the way back up" reports — both were the SCRUB still
// acting post-handoff, not the pin itself).
//
// The pin is NOT retired at the handoff — sticky is the gap-guard. The pin's
// travel leaves scrubPx of vacated space above the block, and on iOS there
// is no JS moment near a gesture that can safely remove it: a same-task
// scrollTo re-anchor probes clean on desktop, but the iOS compositor stomps
// programmatic scrolls around live touches/momentum, so the height change
// lands without its compensation and the page visibly drops to the next
// section (two real-device reports — eager collapse at the handoff in round
// 1, eager collapse on turn-back/touchstart in round 4). While sticky is
// alive the vacated region is geometrically unseeable instead: scrolling
// back up re-pins the block at the viewport top (compositor-native, no JS in
// the path) and repays the travel 1:1, so the previous section is always
// directly above the pinned block — never a gap, at any scroll speed, under
// any momentum. The spacer then collapses only in provably-invisible states,
// on a scroll-quiet timer (see the reclaim block below). The accepted cost:
// a user who turns straight back up without ever pausing feels the demo hold
// at the viewport top while the travel repays — the same hold as the way in,
// with the video playing. Gap, snap, and hold are the only three behaviours
// the consumed travel can produce on the way up; the first two are rejected
// on real-device evidence, and the hold only reaches users who never rest.
export function useMacbookScrub({
  travelRef,
  blockRef,
  videoRef,
  variant,
  enabled,
  onScrubComplete,
  onScrubReenter,
}: Args) {
  const cbComplete = useRef(onScrubComplete);
  const cbReenter = useRef(onScrubReenter);
  useEffect(() => {
    cbComplete.current = onScrubComplete;
    cbReenter.current = onScrubReenter;
  }, [onScrubComplete, onScrubReenter]);

  useEffect(() => {
    if (!enabled) return;
    const travel = travelRef.current;
    const block = blockRef.current;
    const video = videoRef.current;
    if (!travel || !block || !video) return;

    let cleanupCaptionToggle: (() => void) | undefined;
    let cleanupOwnership: (() => void) | undefined;
    let cancelled = false;

    const cleanupDeferred = deferGsap(() => {
      const setup = () => {
        // Off-variant guard. SectionClose mounts BOTH the desktop and mobile
        // MacbookDemo and toggles them with CSS `display` (hidden lg:block /
        // block lg:hidden), so both call this hook. The hidden sibling has a
        // zero-size box; without this guard its `start: "top top"` trigger
        // resolves to scroll 0 and it builds a real scrub trigger at the TOP
        // of the page — driving (and decode-thrashing) its heavy <video>
        // while invisible. Measured here in setup() (post-layout) so the box
        // is real: if the block has no layout box, it's the off-variant —
        // bail before creating any timeline/trigger. The visible variant has
        // a non-zero box; reduced-motion already bailed earlier (`enabled`).
        const box = block.getBoundingClientRect();
        if (box.width === 0 && box.height === 0) return;

        // The visible variant matches the breakpoint by construction (CSS
        // toggles them at lg), so the variant prop is the breakpoint.
        const isDesktop = variant === "desktop";
        const scrubPx = SCRUB_PX[variant];
        // duration is NaN until metadata arrives (NaN is falsy → 2). Setup
        // deliberately does NOT wait for metadata: both demo cuts run 25.2s so
        // the clamp always lands on 2, and gating trigger creation on a network
        // fetch left the zone unregistered until the user could already be
        // inside it on slow connections (the iOS production failure). If a
        // future cut ran shorter than 2s, currentTime writes past duration are
        // clamped by the element — cosmetic only.
        const scrubDuration = Math.min(2, video.duration || 2);

        const caption = block.querySelector<HTMLElement>("[data-demo-caption]");
        const eyebrow = caption?.querySelector<HTMLElement>(
          "[data-demo-caption-eyebrow]",
        );
        const words = caption?.querySelectorAll<HTMLElement>(
          "[data-demo-caption-word]",
        );

        // Geometry is measured once here at setup — a one-shot, early-scroll
        // moment — and intentionally not recomputed on resize.
        const captionH = caption?.offsetHeight ?? 0;
        // UP distance: lift the caption fully off the top edge of the stuck
        // block. Its rest (y:0) is the overlay band above the closed lid, with
        // its box anchored at top:0, so translating up by its own height plus a
        // small buffer clears it past the viewport top — well before the
        // opening screen rises into that band. Same value drives the rise-off
        // and the play toggle.
        const UP = -(captionH + 24);

        // Playback ownership — PERMANENT. `played` flips true when real
        // playback starts (handoff or the replay button) and never flips
        // back: the scrub runs once per page load. While true, scroll is
        // playback-neutral — the scrub stops writing currentTime, the
        // caption stops following the timeline, and re-entering the zone
        // does NOT pause. Two prod reports drove this: (1) the old
        // pause-on-enterBack froze the demo on an open-lid frame with no
        // way to ever reach `ended` (resting just inside the zone end is
        // where iOS momentum naturally lands); (2) releasing ownership on
        // `ended`/leave-above let scrolling up replay the scrub in reverse
        // over a demo the user had already watched.
        let played = false;

        // Travel reclaim (see the architecture comment up top). Collapsing
        // the spacer moves the block's flow position and everything below
        // the wrapper up by scrubPx, so it only ever runs in states where
        // nothing the user can see moves — checked on a scroll-quiet timer,
        // NEVER eagerly during a gesture: rounds 1 and 4 both proved on
        // real iPhones that the iOS compositor stomps any programmatic
        // scroll issued near a live touch or momentum, turning the
        // "compensated" collapse into a visible drop. The two safe states:
        // - "above": the gap sits fully at/above the viewport top (the
        //   user rested at or below the handoff point — the normal
        //   watching-the-demo rest). Collapse, then re-anchor the scroll
        //   position by the same scrubPx in the same task: the block and
        //   everything below it hold pixel-fixed. Safe only at true rest,
        //   so the quiet timer also re-arms while a finger is down.
        // - "clear": the block sits at the wrapper top (sticky repaid the
        //   travel on the way up, or the page restored/jumped above the
        //   section) AND the spacer plus everything after the wrapper sits
        //   below the viewport bottom. Nothing visible moves and the
        //   scroll position stays valid — no re-anchor, nothing for iOS to
        //   stomp. This is also where the pin retires: with zero travel
        //   left the sticky class goes inert.
        // Anywhere else (mid-repay hold, seam on screen after a deep
        // link): wait — sticky guarantees the gap itself can never be
        // revealed in the meantime, so waiting costs nothing visible.
        let reclaimed = false;
        let reclaimTimer: number | undefined;
        let touchActive = false;
        const reclaimState = (): "above" | "clear" | "wait" => {
          // 2px tolerance on all boundaries: scroll positions land on
          // whole device pixels while the measured geometry is fractional,
          // so a user resting exactly at the handoff point can sit a
          // sub-pixel short of "above" forever (measured: 0.07px on
          // mobile). The sliver this admits is gap-black on a black page.
          const rect = travel.getBoundingClientRect();
          if (rect.top + scrubPx <= 2) return "above";
          if (
            rect.top >= -2 &&
            rect.bottom - scrubPx >= window.innerHeight - 2
          ) {
            return "clear";
          }
          return "wait";
        };
        const armReclaimTimer = () => {
          window.clearTimeout(reclaimTimer);
          reclaimTimer = window.setTimeout(onReclaimQuiet, 400);
        };
        const reclaimTravel = (state: "above" | "clear") => {
          reclaimed = true;
          window.clearTimeout(reclaimTimer);
          window.removeEventListener("scroll", onReclaimScroll);
          window.removeEventListener("touchstart", onReclaimTouchStart);
          window.removeEventListener("touchend", onReclaimTouchEnd);
          window.removeEventListener("touchcancel", onReclaimTouchEnd);
          const y = window.scrollY;
          travel.style.setProperty("--scrub-travel", "0px");
          if (state === "above") window.scrollTo(0, y - scrubPx);
          // Triggers below the demo measured the taller layout — re-anchor
          // them to the reclaimed one.
          ScrollTrigger.refresh();
        };
        const onReclaimQuiet = () => {
          if (reclaimed) return;
          if (touchActive) {
            // A finger is down — scrollY is not ours to write. Re-check
            // after it lifts (touchend also re-arms; this covers a held
            // still finger outliving the timer).
            armReclaimTimer();
            return;
          }
          const state = reclaimState();
          if (state === "wait") return;
          reclaimTravel(state);
        };
        const onReclaimScroll = () => {
          if (reclaimed) return;
          armReclaimTimer();
        };
        const onReclaimTouchStart = () => {
          touchActive = true;
        };
        const onReclaimTouchEnd = () => {
          touchActive = false;
          if (!reclaimed) armReclaimTimer();
        };
        const armTravelReclaim = () => {
          window.addEventListener("scroll", onReclaimScroll, { passive: true });
          window.addEventListener("touchstart", onReclaimTouchStart, {
            passive: true,
          });
          window.addEventListener("touchend", onReclaimTouchEnd, {
            passive: true,
          });
          window.addEventListener("touchcancel", onReclaimTouchEnd, {
            passive: true,
          });
          armReclaimTimer();
        };

        const startPlayback = () => {
          if (played) {
            // Re-crossing the handoff with ownership live — just undo an
            // iOS offscreen suspension if one happened.
            if (video.paused && !video.ended) video.play().catch(() => {});
            return;
          }
          played = true;
          // Tells MacbookDemo's warm kiss (play→pause), if still in flight,
          // not to pause a video that has since really started.
          video.dataset.handedOff = "1";
          // The pin is deliberately NOT retired here. The block just rests
          // at sticky's end-of-travel clamp — pixel-identical to a parked
          // pose — and sticky stays live as the gap-guard until the
          // reclaim collapses the travel in an invisible state (see the
          // architecture comment).
          armTravelReclaim();
          video.play().catch(() => {});
          cbComplete.current?.();
        };

        // Reveal (all widths) — words + eyebrow blur-fade up in (hero-style),
        // scrubbed as the section enters. y:0 is the caption's rest position
        // (desktop: overlaying the band above the closed lid; mobile: normal
        // flow above the frame). This reveal only animates the words/eyebrow;
        // the container transform (y) is owned solely by the rise-off +
        // play/end toggle below — never touched here.
        if (caption && words && words.length) {
          // Hidden states (set here, never via data-reveal — global
          // `[data-reveal]{opacity:0}` trap).
          gsap.set([eyebrow, ...words], {
            opacity: 0,
            y: 14,
            filter: "blur(10px)",
          });

          const revealTl = gsap.timeline({
            scrollTrigger: {
              trigger: block,
              start: "top bottom",
              end: "top center",
              scrub: 0.3,
            },
          });

          revealTl
            .to(
              [eyebrow],
              {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                ease: "power2.out",
                duration: 0.3,
              },
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

        const tl = gsap.timeline({
          scrollTrigger: {
            // The wrapper, not the sticky block: the block's rect moves while
            // stuck, the wrapper's doesn't. start "top top" + end "+=scrubPx"
            // covers exactly the sticky travel (wrapper is scrubPx taller).
            trigger: travel,
            start: "top top",
            end: `+=${scrubPx}`,
            scrub: 0.3,
            // Scrub → playback handoff. Just start the video — the block
            // un-sticks on its own as the user scrolls past `end`, and the
            // travel is permanent layout, so there is nothing to tear down,
            // restore, or scroll-correct.
            onLeave: () => startPlayback(),
            // Scrub re-entry (scrolling back up into the zone). After the
            // handoff ownership is permanent, so do nothing. This path only
            // matters pre-handoff (the user crossed the end without the
            // scrub completing — fast flick — then came back): the scrub
            // re-takes the playhead on the next update, so stop anything in
            // flight and let the component hide the replay overlay.
            onEnterBack: () => {
              if (played) return;
              video.pause();
              if (caption) gsap.killTweensOf(caption);
              cbReenter.current?.();
            },
            // Zone-occupancy marker for MacbookDemo's warm kiss: if the kiss
            // resolves while the user is already scrubbing inside the zone
            // (fast flick on a cold cache), its seek-to-frame-0 would snap
            // the lid shut under them — in-zone it pauses without seeking.
            onToggle: (self) => {
              if (self.isActive) video.dataset.inZone = "1";
              else delete video.dataset.inZone;
            },
          },
        });

        // Front-load the scroll onto the start of the clip. A linear ("none")
        // map spends equal scroll on every second of video, so at a normal
        // scroll pace the lid cracks open and swings up almost instantly —
        // the early frames flash past. An ease-in stretches the opening over
        // more scroll (slow at currentTime 0, accelerating toward scrubDuration)
        // so the crack-open reads deliberately, even on a quicker scroll, then
        // hands off to real-time playback near full-open where the lid's own
        // motion is already settling.
        // Tween a proxy, not the video: the timeline keeps mapping scroll
        // position inside the zone even after the handoff (killing it would
        // also kill the trigger's enter/leave bookkeeping), so the
        // currentTime writes are gated on ownership instead.
        const scrub = { t: 0 };
        tl.to(scrub, {
          t: scrubDuration,
          ease: "power1.in",
          duration: 1,
          onUpdate: () => {
            if (!played) video.currentTime = scrub.t;
          },
          onComplete: startPlayback,
        });

        // Rise-off (desktop only) — caption translates UP and off the top edge
        // over roughly the first 45% of the scrub, so it's clear before the
        // opening screen rises into its band. Spliced into the scrub timeline
        // at position 0. immediateRender:false so it animates from the live
        // (y:0 = overlay rest) state. Past the zone the timeline holds at
        // progress 1, so the caption stays UP through playback with no extra
        // bookkeeping; the 'ended' toggle brings it back to y:0.
        if (isDesktop && caption) {
          // Same proxy gating as the scrub tween above: while playback owns
          // the video the caption belongs to the play/ended toggle below
          // (UP during playback, y:0 after ended) — without the gate,
          // scrolling back up the zone mid-playback slid the caption down
          // over the open, playing screen.
          const cap = { y: 0 };
          tl.to(
            cap,
            {
              y: UP,
              ease: "power2.in",
              duration: 0.45,
              immediateRender: false,
              onUpdate: () => {
                if (!played) gsap.set(caption, { y: cap.y });
              },
            },
            0,
          );

          // Play/end toggle — UP off the top on play (post-scrub auto-play +
          // replay, while the lid is open), back DOWN to the overlay rest (y:0,
          // above the centred replay CTA) on end, once the lid has closed.
          // Desktop only. duration 0.5 — settled, deliberate slide.
          // overwrite:"auto" — guards the tick where post-scrub auto-play
          // (startPlayback → play → UP) coincides with the timeline holding UP:
          // two writers on the same property.
          const onPlay = () => {
            // MacbookDemo's buffer-warming kiss (play→pause to make iOS
            // fetch data) marks the element while it runs — not a real
            // playback start, so the caption stays put.
            if (video.dataset.warming) return;
            gsap.to(caption, {
              y: UP,
              ease: "power2.out",
              duration: 0.5,
              overwrite: "auto",
            });
          };
          const onEnded = () => {
            gsap.to(caption, {
              y: 0,
              ease: "power2.out",
              duration: 0.5,
              overwrite: "auto",
            });
          };
          video.addEventListener("play", onPlay);
          video.addEventListener("ended", onEnded);
          cleanupCaptionToggle = () => {
            video.removeEventListener("play", onPlay);
            video.removeEventListener("ended", onEnded);
          };
        }

        // Ownership bookkeeping (all variants). Any real playback start —
        // handoff or the replay button — takes ownership for good; `ended`
        // shows the replay overlay (component-side) but never re-arms the
        // scrub. The kiss's fake play is excluded via its marker.
        const onPlayOwn = () => {
          if (!video.dataset.warming) played = true;
        };
        video.addEventListener("play", onPlayOwn);

        // Playback is never paused on scroll — but iOS suspends media that
        // scrolls fully offscreen mid-playback (leaving it paused with no
        // event the user can see), so resume when the demo scrolls back
        // into view. `ended` stays ended: the replay overlay owns that
        // state.
        const resumeIo = new IntersectionObserver((entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          if (played && video.paused && !video.ended) {
            video.play().catch(() => {});
          }
        });
        resumeIo.observe(block);

        cleanupOwnership = () => {
          video.removeEventListener("play", onPlayOwn);
          resumeIo.disconnect();
          window.clearTimeout(reclaimTimer);
          window.removeEventListener("scroll", onReclaimScroll);
          window.removeEventListener("touchstart", onReclaimTouchStart);
          window.removeEventListener("touchend", onReclaimTouchEnd);
          window.removeEventListener("touchcancel", onReclaimTouchEnd);
        };
      };

      // Gate setup() on document.fonts.ready only — the caption's offsetHeight
      // is measured in setup(), and reading it before Plus Jakarta Sans (a
      // Google Font) has loaded would use fallback-font line metrics, drifting
      // both the rise-off (-captionH) and the DOWN landing (captionH + ...).
      // If the Fonts API is unavailable, proceed without it. There is no
      // video-metadata gate (see scrubDuration above): the trigger must exist
      // before the user can reach the zone, network be damned.
      const whenFontsReady = (run: () => void) => {
        const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
        if (fonts?.ready) {
          fonts.ready.then(() => {
            if (!cancelled) run();
          });
        } else {
          run();
        }
      };

      const runSetup = () => {
        if (cancelled) return;
        whenFontsReady(setup);
      };

      runSetup();
    });

    return () => {
      cancelled = true;
      cleanupCaptionToggle?.();
      cleanupOwnership?.();
      cleanupDeferred();
    };
  }, [travelRef, blockRef, videoRef, variant, enabled]);
}
