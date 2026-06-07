"use client";

import { useGSAP, gsap, ScrollTrigger } from "@/lib/gsap";
import type { RefObject } from "react";

type Args = {
  sectionRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
};

export function useHeroTimeline({ sectionRef, videoRef, enabled }: Args) {
  useGSAP(
    () => {
      if (!enabled) return;
      const section = sectionRef.current;
      const video = videoRef.current;
      if (!section || !video) return;

      const setup = () => {
        ScrollTrigger.config({ ignoreMobileResize: true });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=3000",
            scrub: 0.5,
            pin: true,
            anticipatePin: 1,
            pinType: "fixed",
          },
        });

        tl.to(video, {
          currentTime: video.duration || 1,
          ease: "none",
          duration: 1,
        });

        const logo = section.querySelector<HTMLElement>("[data-hero-logo]");
        if (logo) {
          gsap.set(logo, { opacity: 0, scale: 0.96, y: 12, filter: "blur(6px)" });
          tl.to(
            logo,
            {
              opacity: 1,
              scale: 1,
              y: 0,
              filter: "blur(0px)",
              ease: "power2.out",
              duration: 0.15, // 22% → 37% of timeline
            },
            0.22, // start at 22% — hold the logo back until the scrub is underway
          );
        }

        tl.to(
          video,
          { x: "-28%", scale: 0.78, ease: "power2.inOut", duration: 0.15 },
          0.40,
        );

        if (logo) {
          tl.to(
            logo,
            { scale: 0.7, ease: "power2.inOut", duration: 0.15 },
            0.40,
          );
        }

        const headlineLines = section.querySelectorAll<HTMLElement>(
          "[data-hero-headline-line]",
        );

        headlineLines.forEach((line, lineIdx) => {
          const words = line.querySelectorAll<HTMLElement>("[data-hero-word]");
          if (!words.length) return;

          gsap.set(words, { opacity: 0, y: 14, filter: "blur(10px)" });

          const lineOffset = 0.50 + lineIdx * 0.06; // ~120ms per line at scrub=1, scaled
          tl.to(
            words,
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              ease: "power2.out",
              duration: 0.05,
              stagger: { each: 0.025, from: "start" },
            },
            lineOffset,
          );
        });

        const gradients = section.querySelector<HTMLElement>("[data-hero-gradients]");
        if (gradients) {
          gsap.set(gradients, { opacity: 0 });
          tl.to(
            gradients,
            { opacity: 1, ease: "power1.out", duration: 0.20 },
            0.80,
          );
        }

        return tl;
      };

      if (video.readyState >= 1 && Number.isFinite(video.duration)) {
        setup();
      } else {
        const onMeta = () => {
          setup();
          ScrollTrigger.refresh();
          video.removeEventListener("loadedmetadata", onMeta);
        };
        video.addEventListener("loadedmetadata", onMeta);
      }
    },
    { scope: sectionRef, dependencies: [enabled] },
  );
}
