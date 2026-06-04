"use client";

import { useRef } from "react";
import { MaterialsWordmark } from "@/components/hero/icons/MaterialsWordmark";
import { useReducedMotion } from "@/components/hero/useReducedMotion";
import { FooterPill } from "./FooterPill";
import { useFooterVideoScrub } from "./useFooterVideoScrub";

export function FooterDesktop() {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reducedMotion = useReducedMotion();

  useFooterVideoScrub({ frameRef, videoRef, reducedMotion });

  return (
    <footer
      className="relative w-full overflow-hidden bg-hero-bg"
      aria-label="Site footer"
    >
      <div
        ref={frameRef}
        className="relative h-[clamp(320px,30vw,480px)] w-full select-none"
      >
        <video
          ref={videoRef}
          className="absolute bottom-0 left-1/2 h-auto w-[clamp(520px,64vw,1080px)] -translate-x-1/2"
          muted
          playsInline
          preload="auto"
          poster="/videos/footer-poster.jpg"
          aria-hidden="true"
        >
          <source src="/videos/footer.mp4" type="video/mp4" />
        </video>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #010100 0%, rgba(1,1,0,0) 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[88px]"
          style={{
            background:
              "linear-gradient(to top, rgba(1,1,0,0.75) 0%, rgba(1,1,0,0) 100%)",
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-full"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 150% 100% at 50% 100%, rgba(44,94,160,0.18) 0%, rgba(44,94,160,0) 70%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 110% 80% at 50% 100%, rgba(83,149,237,0.18) 0%, rgba(83,149,237,0) 70%)",
              mixBlendMode: "plus-lighter",
            }}
          />
        </div>

        <div className="pointer-events-none relative z-10 flex h-full items-center justify-center px-12">
          <MaterialsWordmark className="h-auto w-[220px] text-white" />
        </div>

        <div className="absolute inset-x-0 bottom-[28%] z-10 flex justify-center px-12">
          <FooterPill />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-1.5 px-12 pb-7">
          <p className="t-caps text-white/35">VANTA SUPPLY</p>
          <p className="t-caps text-white/55">
            © 2026 Materials¹ — Edition 1
          </p>
        </div>
      </div>
    </footer>
  );
}
