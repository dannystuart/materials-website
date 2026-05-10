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
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=3000",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        tl.to(video, {
          currentTime: video.duration || 1,
          ease: "none",
          duration: 1,
        });

        return tl;
      };

      if (video.readyState >= 1 && Number.isFinite(video.duration)) {
        setup();
      } else {
        const onMeta = () => {
          setup();
          video.removeEventListener("loadedmetadata", onMeta);
        };
        video.addEventListener("loadedmetadata", onMeta);
      }
    },
    { scope: sectionRef, dependencies: [enabled] },
  );
}
