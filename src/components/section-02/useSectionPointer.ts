"use client";

import { RefObject, useEffect, useRef } from "react";

export type PointerTargetRef = RefObject<{ x: number; y: number }>;

/**
 * Tracks pointer position normalized to [-1, 1] within the bounds of `target`.
 * Returns a mutable ref consumers can read every frame (no React renders).
 * Untouched on touch / coarse-pointer / reduced-motion devices.
 */
export function useSectionPointer(
  target: RefObject<HTMLElement | null>,
): PointerTargetRef {
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = target.current;
    if (!el) return;

    const coarse =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarse || reduced) return;

    let rect = el.getBoundingClientRect();

    function update(e: PointerEvent) {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      const nx = (e.clientX - cx) / halfW;
      const ny = (e.clientY - cy) / halfH;
      pointerRef.current.x = Math.max(-1, Math.min(1, nx));
      pointerRef.current.y = Math.max(-1, Math.min(1, ny));
    }

    function leave() {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    }

    function refreshRect() {
      if (el) rect = el.getBoundingClientRect();
    }

    window.addEventListener("pointermove", update, { passive: true });
    el.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", refreshRect, { passive: true });
    window.addEventListener("resize", refreshRect);

    return () => {
      window.removeEventListener("pointermove", update);
      el.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", refreshRect);
      window.removeEventListener("resize", refreshRect);
    };
  }, [target]);

  return pointerRef;
}
