"use client";

import { useRef } from "react";
import { HeroLogo } from "./HeroLogo";
import { HeroHeadline } from "./HeroHeadline";
import { HEADLINE_LINES_MOBILE } from "./headlineLines";
import { HeroVideo } from "./HeroVideo";
import { HeroGradients } from "./HeroGradients";
import { useHeroMobileTimeline } from "./useHeroMobileTimeline";
import { useReducedMotion } from "./useReducedMotion";

export function HeroMobile() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useHeroMobileTimeline({ sectionRef, videoRef, enabled: !reduced });

  return (
    <section
      ref={sectionRef}
      data-hero-section
      data-hero-mobile
      className="relative w-full overflow-hidden bg-hero-bg flex flex-col px-6 pt-12 pb-16 gap-8"
    >
      <div className="z-30 flex flex-col items-center gap-3">
        <p className="t-caps text-white/45">VANTA SUPPLY</p>
        <HeroLogo />
      </div>
      <div className="z-10 flex justify-center">
        <HeroVideo ref={videoRef} variant="mobile" />
      </div>
      <div className="z-30">
        <HeroHeadline lines={HEADLINE_LINES_MOBILE} />
      </div>
      <HeroGradients />
    </section>
  );
}
