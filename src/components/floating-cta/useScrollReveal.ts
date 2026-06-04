"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
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
  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;

    gsap.set(pill, { opacity: 0, pointerEvents: "none" });
    let visible = false;
    let activeTween: gsap.core.Tween | null = null;

    const show = () => {
      if (visible) return;
      visible = true;
      activeTween?.kill();
      if (reducedMotion) {
        gsap.set(pill, { opacity: 1, pointerEvents: "auto" });
        return;
      }
      gsap.set(pill, { pointerEvents: "auto" });
      activeTween = gsap.to(pill, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    };

    const hide = () => {
      if (!visible) return;
      visible = false;
      activeTween?.kill();
      if (reducedMotion) {
        gsap.set(pill, { opacity: 0, pointerEvents: "none" });
        return;
      }
      activeTween = gsap.to(pill, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          gsap.set(pill, { pointerEvents: "none" });
        },
      });
    };

    let threshold = Infinity;
    const computeThreshold = () => {
      const anchor = findVisibleAnchor();
      // Always require scrolling at least 40% of the viewport before revealing,
      // regardless of where the pitch section lands (guards against a short hero
      // pushing the anchor-based threshold to ≤ 0 and showing on page load).
      const minThreshold = window.innerHeight * 0.4;
      if (!anchor) {
        threshold = minThreshold;
        return;
      }
      const rect = anchor.getBoundingClientRect();
      const anchorTopAbsolute = rect.top + window.scrollY;
      threshold = Math.max(
        anchorTopAbsolute - window.innerHeight * 0.85,
        minThreshold,
      );
    };

    const evaluate = () => {
      if (window.scrollY >= threshold) show();
      else hide();
    };

    computeThreshold();
    evaluate();

    const onScroll = () => evaluate();
    const onResize = () => {
      computeThreshold();
      evaluate();
    };

    // The hero pin attaches after this effect runs (waits on video metadata
    // + the deferGsap queue), so the initial threshold is computed against
    // the un-pinned page. Watch the document height and recompute on growth.
    const docHeightObserver = new ResizeObserver(() => {
      computeThreshold();
      evaluate();
    });
    docHeightObserver.observe(document.documentElement);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      docHeightObserver.disconnect();
      activeTween?.kill();
    };
  }, [pillRef, reducedMotion]);
}
