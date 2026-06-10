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
        // Reserve the box before poster/metadata decode (1920×808 poster;
        // cuts are 1920×808 / 1024×430, both ≈2.38:1). Without a reserved
        // aspect the element renders at the replaced-element default 2:1
        // until intrinsic info arrives, shifting everything below by ~30px —
        // late shifts like this go stale in ScrollTrigger zones computed
        // before they settle.
        className={clsx(
          "block w-full h-auto",
          variant === "desktop" ? "aspect-[1920/808]" : "aspect-[1024/430]",
        )}
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
