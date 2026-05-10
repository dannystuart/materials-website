"use client";

import { useGSAP, gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Args = {
  sectionRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
};

export function useHeroMobileTimeline({ sectionRef, videoRef, enabled }: Args) {
  useGSAP(
    () => {
      if (!enabled) return;
      const section = sectionRef.current;
      const video = videoRef.current;
      if (!section) return;

      const logo = section.querySelector<HTMLElement>("[data-hero-logo]");
      const words = section.querySelectorAll<HTMLElement>("[data-hero-word]");
      const gradients = section.querySelector<HTMLElement>("[data-hero-gradients]");

      if (logo) gsap.set(logo, { opacity: 0, y: 12, filter: "blur(6px)" });
      if (video) gsap.set(video, { opacity: 0 });
      if (words.length) gsap.set(words, { opacity: 0, y: 10, filter: "blur(8px)" });
      if (gradients) gsap.set(gradients, { opacity: 0 });

      const tl = gsap.timeline();

      if (logo) {
        tl.to(logo, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.5,
          ease: "power2.out",
        });
      }

      if (video) {
        tl.to(video, { opacity: 1, duration: 0.4, ease: "power1.out" }, "-=0.2")
          .add(() => { void video.play().catch(() => {}); }, "<");
      }

      if (words.length) {
        tl.to(
          words,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.4,
            ease: "power2.out",
            stagger: { each: 0.03, from: "start" },
          },
          "-=0.15",
        );
      }

      if (gradients) {
        tl.to(gradients, { opacity: 1, duration: 0.6 }, "-=0.3");
      }
    },
    { scope: sectionRef, dependencies: [enabled] },
  );
}
