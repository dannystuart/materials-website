"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { whenHeroPinSettled } from "@/lib/heroPinSignal";
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

    // Desktop's hero pins +=3000px once its video metadata arrives — until
    // that pin-spacer exists, the pitch anchor sits a single viewport down
    // and the threshold computed from it belongs to a layout that's about to
    // grow by the full pin distance (the pill faded in mid-hero on any early
    // scroll). Hold the reveal until the hero signals its pin is settled.
    // Mobile's hero never pins and reduced motion never will, so the initial
    // layout is already final there. Safety timeout: if metadata never
    // arrives, the pin never attaches either — the un-pinned threshold is
    // then the correct one, so release the gate rather than lose the CTA.
    const needsHeroGate =
      !reducedMotion && window.matchMedia("(min-width: 1024px)").matches;
    let heroSettled = !needsHeroGate;

    const evaluate = () => {
      if (heroSettled && window.scrollY >= threshold) show();
      else hide();
    };

    const settleHero = () => {
      if (heroSettled) return;
      heroSettled = true;
      computeThreshold();
      evaluate();
    };
    const unsubscribeHero = needsHeroGate
      ? whenHeroPinSettled(settleHero)
      : undefined;
    const heroSafety = needsHeroGate
      ? window.setTimeout(settleHero, 4000)
      : undefined;

    computeThreshold();
    evaluate();

    const onScroll = () => evaluate();
    const onResize = () => {
      computeThreshold();
      evaluate();
    };

    // Belt to the hero-pin gate's braces: any later document-height change
    // (accordion toggles, late media) re-anchors the threshold to the live
    // layout.
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
      unsubscribeHero?.();
      window.clearTimeout(heroSafety);
      activeTween?.kill();
    };
  }, [pillRef, reducedMotion]);
}
