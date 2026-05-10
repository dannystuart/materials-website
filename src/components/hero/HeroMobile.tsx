"use client";

import { useRef } from "react";
import { HeroLogo } from "./HeroLogo";
import { HeroHeadline } from "./HeroHeadline";
import { HeroVideo } from "./HeroVideo";
import { HeroGradients } from "./HeroGradients";

export function HeroMobile() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section
      data-hero-section
      data-hero-mobile
      className="relative w-full min-h-screen overflow-hidden bg-hero-bg flex flex-col px-6 pt-12 pb-0 gap-8"
    >
      <div className="z-30">
        <HeroLogo />
      </div>
      <div className="z-10 flex justify-center">
        <HeroVideo ref={videoRef} variant="mobile" />
      </div>
      <div className="z-30">
        <HeroHeadline />
      </div>
      <HeroGradients />
    </section>
  );
}
