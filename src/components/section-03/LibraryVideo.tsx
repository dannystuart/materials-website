"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/hero/useReducedMotion";
import { clsx } from "@/lib/clsx";

type Props = {
  variant: "desktop" | "mobile";
};

export function LibraryVideo({ variant }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reducedMotion) {
      v.pause();
      return;
    }
    v.play().catch(() => {});
  }, [reducedMotion]);

  return (
    <div
      className={clsx(
        "relative w-full overflow-hidden",
        "library-video-mask",
      )}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="block w-full h-auto"
        muted
        loop
        playsInline
        preload={variant === "desktop" ? "auto" : "metadata"}
        poster="/videos/perspective-poster.jpg"
        role="presentation"
        aria-hidden="true"
      >
        <source
          src={
            variant === "desktop"
              ? "/videos/perspective-1920.mp4"
              : "/videos/perspective-1024.mp4"
          }
          type="video/mp4"
        />
      </video>
    </div>
  );
}
