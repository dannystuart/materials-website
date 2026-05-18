"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
import type { MutableRefObject, RefObject } from "react";

type Args = {
  pillRef: RefObject<HTMLElement | null>;
  rippleRef: RefObject<HTMLElement | null>;
  buttonRef: RefObject<HTMLElement | null>;
  arrowRef: RefObject<HTMLElement | null>;
  borderRef: RefObject<HTMLElement | null>;
  pulseTweenRef: MutableRefObject<gsap.core.Tween | null>;
  reducedMotion: boolean;
};

export function useMagneticPointer({
  pillRef,
  rippleRef,
  buttonRef,
  arrowRef,
  borderRef,
  pulseTweenRef,
  reducedMotion,
}: Args) {
  useEffect(() => {
    if (reducedMotion) return;
    const pill = pillRef.current;
    const ripple = rippleRef.current;
    const button = buttonRef.current;
    const arrow = arrowRef.current;
    if (!pill || !ripple || !button || !arrow) return;

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

    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarse) {
      const onTap = (e: PointerEvent) => {
        const rect = pill.getBoundingClientRect();
        fireRipple(e.clientX - rect.left, e.clientY - rect.top, {
          peakOpacity: 0.9,
          peakRadiusPct: 1.4,
          duration: 0.7,
        });
      };
      pill.addEventListener("pointerdown", onTap);
      return () => {
        pill.removeEventListener("pointerdown", onTap);
      };
    }

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

    const pillEnter = () => {
      const border = borderRef.current;
      if (border) {
        gsap.to(border, {
          opacity: 0.85,
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
      gsap.to(pill, {
        "--cta-saturate": "180%",
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.to(arrow, {
        x: 3,
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
      });
      pulseTweenRef.current?.pause();
    };

    const pillLeave = () => {
      const border = borderRef.current;
      if (border) {
        gsap.to(border, {
          opacity: 0.5,
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto",
          onComplete: () => pulseTweenRef.current?.resume(),
        });
      } else {
        pulseTweenRef.current?.resume();
      }
      gsap.to(pill, {
        "--cta-saturate": "140%",
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.to(arrow, {
        x: 0,
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const buttonEnter = () => {
      gsap.to(button, {
        scale: 1.045,
        duration: 0.3,
        ease: "power3.out",
        overwrite: "auto",
      });
    };
    const buttonLeave = () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const onFocus = () => {
      const border = borderRef.current;
      if (border) {
        gsap.to(border, {
          opacity: 0.85,
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
      gsap.to(pill, {
        "--cta-saturate": "180%",
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.to(arrow, {
        x: 3,
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
      });
      pulseTweenRef.current?.pause();
    };

    const onBlur = () => {
      const border = borderRef.current;
      if (border) {
        gsap.to(border, {
          opacity: 0.5,
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto",
          onComplete: () => pulseTweenRef.current?.resume(),
        });
      } else {
        pulseTweenRef.current?.resume();
      }
      gsap.to(pill, {
        "--cta-saturate": "140%",
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.to(arrow, {
        x: 0,
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const onKeyActivate = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const bRect = button.getBoundingClientRect();
      const pRect = pill.getBoundingClientRect();
      fireRipple(
        bRect.left + bRect.width / 2 - pRect.left,
        bRect.top + bRect.height / 2 - pRect.top,
        { peakOpacity: 0.45, peakRadiusPct: 0.7, duration: 0.4 },
      );
    };

    pill.addEventListener("pointerenter", onEnter);
    pill.addEventListener("pointerleave", onLeave);
    pill.addEventListener("pointerenter", pillEnter);
    pill.addEventListener("pointerleave", pillLeave);
    button.addEventListener("pointerenter", buttonEnter);
    button.addEventListener("pointerleave", buttonLeave);
    button.addEventListener("focus", onFocus);
    button.addEventListener("blur", onBlur);
    button.addEventListener("keydown", onKeyActivate);

    return () => {
      pill.removeEventListener("pointerenter", onEnter);
      pill.removeEventListener("pointerleave", onLeave);
      pill.removeEventListener("pointerenter", pillEnter);
      pill.removeEventListener("pointerleave", pillLeave);
      button.removeEventListener("pointerenter", buttonEnter);
      button.removeEventListener("pointerleave", buttonLeave);
      button.removeEventListener("focus", onFocus);
      button.removeEventListener("blur", onBlur);
      button.removeEventListener("keydown", onKeyActivate);
      gsap.set(button, { clearProps: "transform,scale" });
      gsap.set(arrow, { clearProps: "transform,x" });
    };
  }, [
    pillRef,
    rippleRef,
    buttonRef,
    arrowRef,
    borderRef,
    pulseTweenRef,
    reducedMotion,
  ]);
}
