"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { deferGsap } from "@/lib/scrollTrigger";

type Args = {
  blockRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  onScrubComplete?: () => void;
};

export function useMacbookScrub({
  blockRef,
  videoRef,
  enabled,
  onScrubComplete,
}: Args) {
  const cbRef = useRef(onScrubComplete);
  useEffect(() => {
    cbRef.current = onScrubComplete;
  }, [onScrubComplete]);

  useEffect(() => {
    if (!enabled) return;
    const block = blockRef.current;
    const video = videoRef.current;
    if (!block || !video) return;

    let cleanupMeta: (() => void) | undefined;
    let cleanupToggle: (() => void) | undefined;
    let cleanupTeardown: (() => void) | undefined;
    let cancelled = false;

    const cleanupDeferred = deferGsap(() => {
      const setup = () => {
        // Off-variant guard. SectionClose mounts BOTH the desktop and mobile
        // MacbookDemo and toggles them with CSS `display` (hidden lg:block /
        // block lg:hidden), so both call this hook. The hidden sibling has a
        // zero-size box; without this guard its `start: "top top"` pin resolves
        // to scroll 0 and it builds a real pinned scrub trigger at the TOP of
        // the page — driving (and decode-thrashing) its heavy <video> while
        // invisible. Measured here in setup() (post-layout) so the box is real:
        // if the block has no layout box, it's the off-variant — bail before
        // creating any timeline/trigger. The visible variant has a non-zero
        // box; reduced-motion already bailed earlier (`enabled`).
        const box = block.getBoundingClientRect();
        if (box.width === 0 && box.height === 0) return;

        const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
        const scrubPx = isDesktop ? 800 : 500;
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
        // UP distance: lift the caption fully off the top edge of the pinned
        // block. Its rest (y:0) is the overlay band above the closed lid, with
        // its box anchored at top:0, so translating up by its own height plus a
        // small buffer clears it past the viewport top — well before the
        // opening screen rises into that band. Same value drives the rise-off,
        // the play toggle, and the onLeave re-lift.
        const UP = -(captionH + 24);

        let played = false;
        const startPlayback = () => {
          if (played) return;
          played = true;
          video.play().catch(() => {});
          cbRef.current?.();
        };

        // Reveal (all widths) — words + eyebrow blur-fade up in (hero-style),
        // scrubbed as the section enters. y:0 is the caption's rest position
        // (desktop: overlaying the band above the closed lid; mobile: normal
        // flow above the frame). This reveal only animates the words/eyebrow;
        // the container transform (y) is owned solely by the pin rise-off +
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
            trigger: block,
            start: "top top",
            end: `+=${scrubPx}`,
            scrub: 0.3,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            pinType: "fixed",
            onLeave: (self) => {
              // Hand off scrub → playback. Start playing immediately so the
              // demo never stalls, but DEFER the pin teardown until scroll
              // settles. The teardown (disable(true) → remove the pin-spacer →
              // re-anchor with scrollBy) shrinks the document by scrubPx; doing
              // that mid-flick fights iOS momentum scrolling — the content below
              // leaps up and the scrollBy correction wrestles live momentum,
              // jerking the page down to the pricing cards. Chrome hides this
              // because its scroll anchoring silently absorbs the spacer removal
              // (probe: scrollBy was only -45px, not -500). We wait for the flick
              // to stop, THEN tear down against a stationary page — no momentum
              // to fight. See docs/plans/2026-06-08-section05-scrub-bugs.md.
              startPlayback();

              // Idempotent: if a teardown is already pending (e.g. onLeave +
              // onComplete both fired), keep the first one.
              if (cleanupTeardown) return;

              const teardown = () => {
                cleanupTeardown?.();
                cleanupTeardown = undefined;
                if (cancelled) return;
                // disable(true) → revert(true,true) → update(true) rewinds
                // animation.totalProgress(0), which sets currentTime back to 0.
                // Capture and restore around it. Same tick = no visible flicker.
                // Captured HERE (at settle, not at onLeave) because the video has
                // been playing during the wait, so currentTime has advanced past
                // scrubDuration — that advanced frame is the one to preserve.
                // See docs/scroll-scrubbed-video-recipe.md (Bug 6).
                const pin = self.pin as HTMLElement | undefined;
                const savedTime = video.currentTime;
                self.disable(true);
                // disable(true) also reverts the rise-off, snapping the caption
                // back to its overlay rest (y:0). But playback is running and the
                // lid is open — the live screen fills that band — so on desktop,
                // re-lift it off the top in the SAME tick (no paint between) to
                // avoid a flash of the heading over the screen. The 'ended'
                // toggle brings it back to y:0 once the lid closes.
                if (isDesktop && caption) {
                  gsap.set(caption, { y: UP });
                }
                if (Number.isFinite(savedTime) && savedTime > 0) {
                  video.currentTime = savedTime;
                }
                // Re-anchor: after the spacer is removed the element sits above
                // viewport top (≈ -scrubPx); scrollBy in the same tick puts it
                // back where the user was looking — no paint between, no jump,
                // no gap above the demo on scroll-up (Bug 4).
                if (pin) {
                  const offset = pin.getBoundingClientRect().top;
                  if (offset) window.scrollBy(0, offset);
                }
              };

              // Settle detection. iOS Safari doesn't reliably fire `scrollend`,
              // so the primary signal is a rAF velocity poll: when scrollY stops
              // changing for a couple of frames, the flick has stopped. We also
              // listen for `scrollend` where it exists, as a faster path. If the
              // user scrolls back UP into the trigger range before settling, the
              // trigger re-enters and re-pins on its own; we cancel the pending
              // teardown so it doesn't fire against a re-engaged pin (which would
              // double-shrink the document / strand the spacer).
              let rafId = 0;
              let still = 0;
              let lastY = window.scrollY;
              const STILL_FRAMES = 3; // ~50ms at 60fps of no movement = settled.

              const finish = () => {
                window.removeEventListener("scrollend", onScrollEnd);
                cancelAnimationFrame(rafId);
                teardown();
              };

              const onScrollEnd = () => finish();

              const poll = () => {
                const y = window.scrollY;
                still = Math.abs(y - lastY) < 0.5 ? still + 1 : 0;
                lastY = y;
                // Re-entry guard: if scroll has carried the user back above the
                // pin end, bail and let the live trigger own the pin again.
                if (self.scroll() < self.end) {
                  cleanupTeardown?.();
                  cleanupTeardown = undefined;
                  return;
                }
                if (still >= STILL_FRAMES) {
                  finish();
                  return;
                }
                rafId = requestAnimationFrame(poll);
              };

              cleanupTeardown = () => {
                window.removeEventListener("scrollend", onScrollEnd);
                cancelAnimationFrame(rafId);
              };
              window.addEventListener("scrollend", onScrollEnd);
              rafId = requestAnimationFrame(poll);
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
        tl.to(video, {
          currentTime: scrubDuration,
          ease: "power1.in",
          duration: 1,
          onComplete: startPlayback,
        });

        // Rise-off (desktop only) — caption translates UP and off the top edge
        // over roughly the first 45% of the pinned scrub, so it's clear before
        // the opening screen rises into its band. Spliced into the pin timeline
        // at position 0. immediateRender:false so it animates from the live
        // (y:0 = overlay rest) state. onLeave re-lifts to UP (see above).
        if (isDesktop && caption) {
          tl.to(
            caption,
            {
              y: UP,
              ease: "power2.in",
              duration: 0.45,
              immediateRender: false,
            },
            0,
          );

          // Play/end toggle — UP off the top on play (post-scrub auto-play +
          // replay, while the lid is open), back DOWN to the overlay rest (y:0,
          // above the centred replay CTA) on end, once the lid has closed.
          // Desktop only. duration 0.5 — settled, deliberate slide.
          // overwrite:"auto" — guards the tick where post-scrub auto-play
          // (startPlayback → play → UP) coincides with onLeave's re-lift (also
          // → UP): two writers on the same property.
          const onPlay = () => {
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
          cleanupToggle = () => {
            video.removeEventListener("play", onPlay);
            video.removeEventListener("ended", onEnded);
          };
        }
      };

      // Gate setup() on BOTH video metadata readiness (for duration) AND
      // document.fonts.ready — the caption's offsetHeight is measured here, and
      // reading it before Plus Jakarta Sans (a Google Font) has loaded would use
      // fallback-font line metrics, drifting both the rise-off (-captionH) and
      // the DOWN landing (captionH + ...). If the Fonts API is unavailable,
      // proceed without it.
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

      if (video.readyState >= 1 && Number.isFinite(video.duration)) {
        runSetup();
      } else {
        const onMeta = () => {
          video.removeEventListener("loadedmetadata", onMeta);
          runSetup();
        };
        video.addEventListener("loadedmetadata", onMeta);
        cleanupMeta = () => video.removeEventListener("loadedmetadata", onMeta);
      }
    });

    return () => {
      cancelled = true;
      cleanupMeta?.();
      cleanupToggle?.();
      cleanupTeardown?.();
      cleanupDeferred();
    };
  }, [blockRef, videoRef, enabled]);
}
