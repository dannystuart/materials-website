"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Args = {
  pillRef: RefObject<HTMLElement | null>;
  rippleRef: RefObject<HTMLElement | null>;
  reducedMotion: boolean;
};

export function useMagneticPointer({
  pillRef,
  rippleRef,
  reducedMotion,
}: Args) {
  useEffect(() => {
    if (reducedMotion) return;
    const pill = pillRef.current;
    const ripple = rippleRef.current;
    if (!pill || !ripple) return;

    const fireRipple = (
      x: number,
      y: number,
      opts: { peakOpacity: number; peakRadiusPct: number; duration: number },
    ) => {
      const rect = pill.getBoundingClientRect();
      const peakRadius = rect.width * opts.peakRadiusPct;
      gsap.set(ripple, {
        "--ripple-x": `${x}px`,
        "--ripple-y": `${y}px`,
        "--ripple-radius": "0px",
        "--ripple-opacity": opts.peakOpacity,
      });
      gsap.to(ripple, {
        "--ripple-radius": `${peakRadius}px`,
        "--ripple-opacity": 0,
        duration: opts.duration,
        ease: "power2.out",
      });
    };

    const onEnter = (e: PointerEvent) => {
      const rect = pill.getBoundingClientRect();
      fireRipple(e.clientX - rect.left, e.clientY - rect.top, {
        peakOpacity: 0.9,
        peakRadiusPct: 1.4,
        duration: 0.7,
      });
    };

    const onLeave = (e: PointerEvent) => {
      const rect = pill.getBoundingClientRect();
      fireRipple(e.clientX - rect.left, e.clientY - rect.top, {
        peakOpacity: 0.45,
        peakRadiusPct: 0.7,
        duration: 0.4,
      });
    };

    pill.addEventListener("pointerenter", onEnter);
    pill.addEventListener("pointerleave", onLeave);
    return () => {
      pill.removeEventListener("pointerenter", onEnter);
      pill.removeEventListener("pointerleave", onLeave);
    };
  }, [pillRef, rippleRef, reducedMotion]);
}
