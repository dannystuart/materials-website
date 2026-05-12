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

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

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

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let arrowTarget = 0;
    let arrowCurrent = 0;
    let scaleTarget = 1;
    let scaleCurrent = 1;
    let rafId = 0;

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

    const onMove = (e: PointerEvent) => {
      const rect = button.getBoundingClientRect();
      const bx = rect.left + rect.width / 2;
      const by = rect.top + rect.height / 2;
      target.x = clamp((e.clientX - bx) * 0.08, -4, 4);
      target.y = clamp((e.clientY - by) * 0.08, -2, 2);
    };

    const pillEnter = () => {
      arrowTarget = 2;
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
      pulseTweenRef.current?.pause();
    };

    const pillLeave = () => {
      target.x = 0;
      target.y = 0;
      arrowTarget = 0;
      const border = borderRef.current;
      if (border) {
        gsap.to(border, {
          opacity: 0.35,
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
    };

    const buttonEnter = () => {
      scaleTarget = 1.04;
    };
    const buttonLeave = () => {
      scaleTarget = 1;
    };

    const loop = () => {
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      arrowCurrent += (arrowTarget - arrowCurrent) * 0.18;
      scaleCurrent += (scaleTarget - scaleCurrent) * 0.18;
      button.style.transform = `translate(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px) scale(${scaleCurrent.toFixed(4)})`;
      arrow.style.transform = `translateX(${arrowCurrent.toFixed(2)}px)`;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    pill.addEventListener("pointerenter", onEnter);
    pill.addEventListener("pointerleave", onLeave);
    pill.addEventListener("pointerenter", pillEnter);
    pill.addEventListener("pointerleave", pillLeave);
    pill.addEventListener("pointermove", onMove);
    button.addEventListener("pointerenter", buttonEnter);
    button.addEventListener("pointerleave", buttonLeave);

    return () => {
      pill.removeEventListener("pointerenter", onEnter);
      pill.removeEventListener("pointerleave", onLeave);
      pill.removeEventListener("pointerenter", pillEnter);
      pill.removeEventListener("pointerleave", pillLeave);
      pill.removeEventListener("pointermove", onMove);
      button.removeEventListener("pointerenter", buttonEnter);
      button.removeEventListener("pointerleave", buttonLeave);
      cancelAnimationFrame(rafId);
      button.style.transform = "";
      arrow.style.transform = "";
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
