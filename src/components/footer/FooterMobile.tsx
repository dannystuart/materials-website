"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { MaterialsWordmark } from "@/components/hero/icons/MaterialsWordmark";
import { useReducedMotion } from "@/components/hero/useReducedMotion";
import { FooterPill } from "./FooterPill";

export function FooterMobile() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reducedMotion = useReducedMotion();

  // Yo-yo the ambient material clip (forward → reverse → forward) instead of a
  // hard loop, so there's no jarring jump-cut back to frame 0 each cycle. Native
  // playback can't run in reverse, so drive video.currentTime from a GSAP proxy
  // tween. The forward leg lasts video.duration / 0.4 to preserve the prior 0.4×
  // slow feel. Reduced motion: hold one mid-clip still frame, no tween.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let tween: gsap.core.Tween | null = null;

    const start = () => {
      if (!video.duration) return;

      if (reducedMotion) {
        try {
          video.currentTime = video.duration / 2;
        } catch {
          // ignore seek errors
        }
        return;
      }

      video.pause();
      const proxy = { t: 0 };
      tween = gsap.to(proxy, {
        t: video.duration,
        duration: video.duration / 0.4,
        ease: "none",
        repeat: -1,
        yoyo: true,
        onUpdate: () => {
          try {
            video.currentTime = proxy.t;
          } catch {
            // ignore seek errors mid-scrub
          }
        },
      });
    };

    if (video.readyState >= 1 && video.duration) {
      start();
    } else {
      video.addEventListener("loadedmetadata", start, { once: true });
    }

    return () => {
      tween?.kill();
      video.removeEventListener("loadedmetadata", start);
    };
  }, [reducedMotion]);

  return (
    <footer
      className="relative w-full overflow-hidden bg-hero-bg"
      aria-label="Site footer"
    >
      <div className="relative h-[clamp(240px,58vw,340px)] w-full">
        <video
          ref={videoRef}
          className="absolute bottom-0 left-1/2 h-auto w-[94vw] max-w-[500px] -translate-x-1/2"
          muted
          playsInline
          preload="metadata"
          poster="/videos/footer-poster.jpg"
          aria-hidden="true"
        >
          <source src="/videos/footer-960.mp4" type="video/mp4" />
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
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[72px]"
          style={{
            background:
              "linear-gradient(to top, rgba(1,1,0,0.8) 0%, rgba(1,1,0,0) 100%)",
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

        <div className="relative z-20 flex h-full items-start justify-center px-6 pt-[clamp(28px,8vw,44px)]">
          <MaterialsWordmark className="h-auto w-[200px] text-white" />
        </div>

        <div className="absolute inset-x-0 bottom-[30%] z-10 flex justify-center px-6">
          <FooterPill />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-6 pb-6 text-center">
          <p className="t-caps text-white/55">
            © 2026 Materials¹ — Edition 1
          </p>
        </div>
      </div>
    </footer>
  );
}
