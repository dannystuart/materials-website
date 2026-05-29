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

        // Beat 1 + Beat 2 — the caption lives in normal flow ABOVE the video
        // frame; its untransformed position is its rest spot. Created before
        // the pin timeline so they sit first in this same deferGsap block.
        if (caption && words && words.length) {
          // Reveal transform: scale up to ~2x (line 28px -> ~56px) and
          // translate DOWN so the caption overlays the vertical centre of the
          // video. Measured, not hard-coded, so it stays centred responsively.
          const REVEAL_SCALE = 2;
          const videoH = video.getBoundingClientRect().height || block.offsetHeight;
          // The caption uses `transform-origin: top center` (set in
          // MacbookDemo.tsx), so scaling pins its top edge in place. The caption
          // sits directly above the video — its top is the block top and the
          // video starts at the caption's bottom — so the scaled visual centre
          // lands at `y + captionH`. The video's vertical centre is at
          // `captionH + videoH/2`. Setting y + captionH = captionH + videoH/2
          // cancels captionH, leaving revealY = videoH/2.
          // Geometry is measured once here at setup — a one-shot, early-scroll
          // moment — and intentionally not recomputed on resize.
          const revealY = videoH / 2;

          if (isDesktop) {
            // Container starts in the big + over-video state (set here, never
            // via data-reveal). Beat 2 animates it back to identity (= rest).
            gsap.set(caption, { y: revealY, scale: REVEAL_SCALE });
          }
          // Words/eyebrow hidden for the de-blur reveal (Beat 1).
          gsap.set([eyebrow, ...words], {
            opacity: 0,
            y: 14,
            filter: "blur(10px)",
          });

          // Beat 1 — scrubbed per-word reveal, completes as block hits centre.
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

          // Beat 2 — one-way rise + shrink to rest above the video (desktop
          // only). Fires once at pin engage; never reverses, so it parks above
          // the video.
          if (isDesktop) {
            gsap
              .timeline({
                scrollTrigger: { trigger: block, start: "top top", once: true },
              })
              // duration 0.6 is a feel value tuning the rise's pace — this beat
              // is time-based, distinct from the scrubbed (scroll-linked) reveal.
              .to(caption, { y: 0, scale: 1, ease: "power2.out", duration: 0.6 });
          }
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
