"use client";

import { useGSAP, gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Args = {
  pillRef: RefObject<HTMLElement | null>;
  reducedMotion: boolean;
};

function findVisibleAnchor(): HTMLElement | null {
  const candidates = document.querySelectorAll<HTMLElement>(
    '[data-section="pitch"]',
  );
  for (const el of candidates) {
    if (el.offsetParent !== null) return el;
  }
  return candidates[0] ?? null;
}

export function useScrollReveal({ pillRef, reducedMotion }: Args) {
  useGSAP(
    () => {
      const pill = pillRef.current;
      if (!pill) return;

      const anchor = findVisibleAnchor();
      if (!anchor) return;

      gsap.set(pill, {
        opacity: 0,
        y: -12,
        pointerEvents: "none",
      });

      const tween = gsap.fromTo(
        pill,
        { opacity: 0, y: -12, pointerEvents: "none" },
        {
          opacity: 1,
          y: 0,
          pointerEvents: "auto",
          duration: reducedMotion ? 0 : 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: anchor,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: pillRef, dependencies: [reducedMotion] },
  );
}
