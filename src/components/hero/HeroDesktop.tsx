"use client";

import { useRef } from "react";
import { HeroLogo } from "./HeroLogo";
import { HeroHeadline } from "./HeroHeadline";
import { HeroVideo } from "./HeroVideo";
import { HeroGradients } from "./HeroGradients";
import { useHeroTimeline } from "./useHeroTimeline";
import { useReducedMotion } from "./useReducedMotion";

export function HeroDesktop() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useHeroTimeline({ sectionRef, videoRef, enabled: !reduced });

  return (
    <section
      ref={sectionRef}
      data-hero-section
      className="relative w-full min-h-screen overflow-hidden bg-hero-bg"
    >
      <div
        className="absolute inset-0 z-10 flex items-center justify-center [&>video]:h-[85vh] [&>video]:w-auto [&>video]:max-w-none"
        data-hero-video-slot
      >
        <HeroVideo ref={videoRef} variant="desktop" />
      </div>
      <div className="absolute inset-0 z-20">
        <HeroGradients />
      </div>
      <div className="absolute top-0 inset-x-0 z-30 flex justify-center pt-8">
        <p className="t-caps text-white/45">VANTA SUPPLY</p>
      </div>
      <div
        className="absolute top-1/2 left-12 z-30 -translate-y-1/2 min-[1600px]:left-[12vw] min-[2200px]:left-[20vw]"
        data-hero-logo-slot
      >
        <HeroLogo />
      </div>
      <div
        className="absolute top-1/2 right-24 z-30 -translate-y-1/2 max-w-[595px] min-[1600px]:right-[14vw] min-[2200px]:right-[22vw]"
        data-hero-headline-slot
      >
        <HeroHeadline />
      </div>
    </section>
  );
}
