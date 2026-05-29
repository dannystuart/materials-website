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

        let played = false;
        const startPlayback = () => {
          if (played) return;
          played = true;
          video.play().catch(() => {});
          cbRef.current?.();
        };

        // Beat 1 — reveal the caption hero-style as the block approaches the
        // pin point. Created before the pin timeline so it sits first in this
        // same deferGsap block.
        if (caption && words && words.length) {
          // Hidden initial state — set here, NOT via data-reveal (global CSS
          // [data-reveal]{opacity:0} would hide it permanently). Matches the
          // hero word-reveal 1:1.
          gsap.set([eyebrow, ...words], {
            opacity: 0,
            y: 14,
            filter: "blur(10px)",
          });

          const revealTl = gsap.timeline({
            scrollTrigger: {
              trigger: block,
              start: "top bottom", // block enters from viewport bottom
              end: "top top", // ...up to the pin point
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

        // Beat 2 — rise + shrink + fade the whole caption over the first ~25%
        // of the pinned scrub. immediateRender: false defers start-value
        // capture to first render, so the tween fades from the live
        // (Beat-1-revealed) state rather than the hidden build-time state.
        if (caption) {
          tl.to(
            caption,
            {
              y: -60,
              scale: 0.82,
              opacity: 0,
              ease: "power2.in",
              duration: 0.25,
              immediateRender: false,
            },
            0,
          );
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
      cleanupDeferred();
    };
  }, [blockRef, videoRef, enabled]);
}
