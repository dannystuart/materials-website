"use client";

import { useRef } from "react";
import { HeroLogo } from "./HeroLogo";
import { HeroHeadline } from "./HeroHeadline";
import { HeroVideo } from "./HeroVideo";
import { HeroGradients } from "./HeroGradients";

export function HeroDesktop() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section
      ref={sectionRef}
      data-hero-section
      className="relative w-full min-h-screen overflow-hidden bg-hero-bg"
    >
      <div className="absolute inset-0 grid grid-cols-12 gap-x-6 px-12 pt-24">
        <div className="col-span-3 z-30" data-hero-logo-slot>
          <HeroLogo />
        </div>
        <div
          className="col-span-6 z-10 flex items-center justify-center"
          data-hero-video-slot
        >
          <HeroVideo ref={videoRef} variant="desktop" />
        </div>
        <div className="col-span-3 z-30 flex items-center" data-hero-headline-slot>
          <HeroHeadline />
        </div>
      </div>
      <div className="absolute inset-0 z-20">
        <HeroGradients />
      </div>
    </section>
  );
}
