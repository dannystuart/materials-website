"use client";

import { useGSAP, gsap, ScrollTrigger } from "@/lib/gsap";
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

      if (reducedMotion) {
        const st = ScrollTrigger.create({
          trigger: anchor,
          start: "top 85%",
          onEnter: () =>
            gsap.set(pill, { opacity: 1, y: 0, pointerEvents: "auto" }),
          onLeaveBack: () =>
            gsap.set(pill, { opacity: 0, y: -12, pointerEvents: "none" }),
        });
        return () => {
          st.kill();
        };
      }

      const tween = gsap.to(pill, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
        paused: true,
        onStart: () => gsap.set(pill, { pointerEvents: "auto" }),
        onReverseComplete: () => gsap.set(pill, { pointerEvents: "none" }),
      });

      const st = ScrollTrigger.create({
        trigger: anchor,
        start: "top 85%",
        onEnter: () => tween.play(),
        onLeaveBack: () => tween.reverse(),
      });

      return () => {
        st.kill();
        tween.kill();
      };
    },
    { scope: pillRef, dependencies: [reducedMotion] },
  );
}
