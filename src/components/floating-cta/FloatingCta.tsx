"use client";

import { useRef } from "react";
import type { CSSProperties } from "react";
import { useGSAP, gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/components/hero/useReducedMotion";
import { useScrollReveal } from "./useScrollReveal";
import { useMagneticPointer } from "./useMagneticPointer";

export function FloatingCta() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const borderRef = useRef<HTMLSpanElement | null>(null);
  const rippleRef = useRef<HTMLSpanElement | null>(null);
  const buttonRef = useRef<HTMLAnchorElement | null>(null);
  const arrowRef = useRef<HTMLSpanElement | null>(null);
  const pulseTweenRef = useRef<gsap.core.Tween | null>(null);
  const reducedMotion = useReducedMotion();

  useScrollReveal({ pillRef: rootRef, reducedMotion });
  useMagneticPointer({
    pillRef: rootRef,
    rippleRef,
    buttonRef,
    arrowRef,
    borderRef,
    pulseTweenRef,
    reducedMotion,
  });

  useGSAP(
    () => {
      if (reducedMotion) return;
      const border = borderRef.current;
      if (!border) return;

      pulseTweenRef.current = gsap.to(border, {
        opacity: 0.7,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      return () => {
        pulseTweenRef.current?.kill();
        pulseTweenRef.current = null;
      };
    },
    { dependencies: [reducedMotion] },
  );

  const rootStyle = {
    "--cta-saturate": "140%",
    WebkitBackdropFilter: "blur(20px) saturate(var(--cta-saturate))",
    backdropFilter: "blur(20px) saturate(var(--cta-saturate))",
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      data-cta-root
      className="
        fixed top-4 md:top-5 left-1/2 -translate-x-1/2 z-50
        flex items-center
        h-[52px] md:h-12 pl-3 md:pl-4 pr-1 md:pr-1.5
        rounded-full
        bg-[rgba(8,8,12,0.72)]
        shadow-[0_10px_40px_rgba(0,0,0,0.5)]
        will-change-transform
      "
      style={rootStyle}
    >
      <span ref={rippleRef} aria-hidden="true" className="cta-ripple" />
      <span
        ref={borderRef}
        aria-hidden="true"
        data-cta-border
        className="cta-pill-border pointer-events-none absolute inset-0 rounded-full"
      />

      <nav aria-label="Buy" className="relative flex items-center gap-3">
        <span className="text-[13px] md:text-[14px] font-medium tracking-normal text-white/85 select-none whitespace-nowrap">
          Materials<sup className="text-[0.6em] align-super">1</sup> — Edition 1
        </span>
        <span aria-hidden="true" className="h-5 w-px bg-white/12" />
        <a
          ref={buttonRef}
          href="https://dannystuart.gumroad.com/l/Materials-Edition-1?utm_source=materials-website&utm_medium=floating-cta&utm_campaign=materials-edition-1"
          data-cta-button
          className="
            cta-focus-ring cta-button
            relative inline-flex items-center gap-1
            rounded-full bg-white text-[#0A0A0F]
            px-3 md:px-4 min-h-[44px] md:min-h-0 md:py-[9px]
            text-[13px] md:text-[14px] font-semibold
            will-change-transform
            focus:outline-none
          "
        >
          <span>Buy</span>
          <span
            ref={arrowRef}
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
