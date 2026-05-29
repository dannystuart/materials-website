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

    const cleanupDeferred = deferGsap(() => {
      const setup = () => {
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
        const videoH = video.getBoundingClientRect().height || block.offsetHeight;
        // DOWN distance: drop the heading over the video's upper area so it
        // sits just above the centred replay overlay ("Want another look?").
        // captionH carries it past its own height; 0.19 * videoH lands its
        // baseline ~28px above the overlay text (tuned in-browser at 1440).
        const downY = captionH + videoH * 0.19;

        let played = false;
        const startPlayback = () => {
          if (played) return;
          played = true;
          video.play().catch(() => {});
          cbRef.current?.();
        };

        // Reveal (all widths) — the caption lives in normal flow ABOVE the
        // video frame; y:0 is its rest/UP position. Words + eyebrow blur-fade
        // up in (hero-style), scrubbed as the section enters. The container
        // transform (y) is owned solely by the pin rise-off + play/end toggle
        // below — never touched here.
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
              startPlayback();
              // disable(true) → revert(true,true) → update(true) rewinds
              // animation.totalProgress(0), which sets currentTime back to 0.
              // Capture and restore around it. Same tick = no visible flicker.
              // See docs/scroll-scrubbed-video-recipe.md.
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
            },
          },
        });

        tl.to(video, {
          currentTime: scrubDuration,
          ease: "none",
          duration: 1,
          onComplete: startPlayback,
        });

        // Rise-off (desktop only) — caption translates UP and off the top edge
        // over roughly the first half of the pinned scrub, so it's gone before
        // the lid is fully open. Spliced into the pin timeline at position 0.
        // immediateRender:false so it animates from the live (y:0) state.
        // onLeave's disable(true)/revert returns y to 0 (= UP) for free.
        if (isDesktop && caption) {
          tl.to(
            caption,
            {
              y: -captionH,
              ease: "power2.in",
              duration: 0.5,
              immediateRender: false,
            },
            0,
          );

          // Play/end toggle — UP on play (post-scrub auto-play + replay), DOWN
          // on end (above the centred replay overlay). Desktop only.
          const onPlay = () => {
            gsap.to(caption, { y: 0, ease: "power2.out", duration: 0.5 });
          };
          const onEnded = () => {
            gsap.to(caption, { y: downY, ease: "power2.out", duration: 0.5 });
          };
          video.addEventListener("play", onPlay);
          video.addEventListener("ended", onEnded);
          cleanupToggle = () => {
            video.removeEventListener("play", onPlay);
            video.removeEventListener("ended", onEnded);
          };
        }
      };

      if (video.readyState >= 1 && Number.isFinite(video.duration)) {
        setup();
      } else {
        const onMeta = () => {
          video.removeEventListener("loadedmetadata", onMeta);
          setup();
        };
        video.addEventListener("loadedmetadata", onMeta);
        cleanupMeta = () => video.removeEventListener("loadedmetadata", onMeta);
      }
    });

    return () => {
      cleanupMeta?.();
      cleanupToggle?.();
      cleanupDeferred();
    };
  }, [blockRef, videoRef, enabled]);
}
