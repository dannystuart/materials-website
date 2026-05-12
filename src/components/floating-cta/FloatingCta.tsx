"use client";

import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/components/hero/useReducedMotion";
import { useScrollReveal } from "./useScrollReveal";
import { useMagneticPointer } from "./useMagneticPointer";

export function FloatingCta() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const borderRef = useRef<HTMLSpanElement | null>(null);
  const rippleRef = useRef<HTMLSpanElement | null>(null);
  const reducedMotion = useReducedMotion();

  useScrollReveal({ pillRef: rootRef, reducedMotion });
  useMagneticPointer({ pillRef: rootRef, rippleRef, reducedMotion });

  useGSAP(
    () => {
      if (reducedMotion) return;
      const border = borderRef.current;
      if (!border) return;

      const tween = gsap.to(border, {
        opacity: 0.45,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      return () => {
        tween.kill();
      };
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <div
      ref={rootRef}
      data-cta-root
      className="
        fixed top-5 left-1/2 -translate-x-1/2 z-50
        flex items-center
        h-12 pl-4 pr-1.5
        rounded-full overflow-hidden
        bg-[rgba(8,8,12,0.72)]
        backdrop-blur-xl backdrop-saturate-[1.4]
        shadow-[0_10px_40px_rgba(0,0,0,0.5)]
        will-change-transform
      "
      style={{
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
      }}
    >
      <span
        ref={rippleRef}
        aria-hidden="true"
        className="cta-ripple"
      />
      <span
        ref={borderRef}
        aria-hidden="true"
        data-cta-border
        className="cta-pill-border pointer-events-none absolute inset-0 rounded-full"
      />

      <nav aria-label="Buy" className="relative flex items-center gap-3">
        <span className="text-[14px] font-medium tracking-normal text-white/85 select-none">
          Materials<sup className="text-[0.6em] align-super">1</sup> — Edition 1
        </span>
        <span aria-hidden="true" className="h-5 w-px bg-white/12" />
        <a
          href="#buy"
          data-cta-button
          className="
            relative inline-flex items-center gap-1
            rounded-full bg-white text-[#0A0A0F]
            px-4 py-[9px]
            text-[14px] font-semibold
            will-change-transform
            focus:outline-none
          "
        >
          <span>Buy</span>
          <span
            data-cta-arrow
            aria-hidden="true"
            className="inline-block will-change-transform"
          >
            →
          </span>
        </a>
      </nav>
    </div>
  );
}
