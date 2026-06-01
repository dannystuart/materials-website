"use client";

import { useEffect, type RefObject } from "react";

type Options = {
  frameRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  reducedMotion: boolean;
};

const LERP = 0.14;
const SETTLE = 0.0015;

export function useFooterVideoScrub({
  frameRef,
  videoRef,
  reducedMotion,
}: Options) {
  useEffect(() => {
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!frame || !video) return;

    let duration = 0;
    let target = 0;
    let current = 0;
    let raf = 0;
    let seeded = false;

    const seedMiddle = () => {
      if (!duration || seeded) return;
      try {
        video.currentTime = duration / 2;
        current = duration / 2;
        target = duration / 2;
        seeded = true;
      } catch {
        // ignore
      }
    };

    const tick = () => {
      const delta = target - current;
      if (Math.abs(delta) < SETTLE) {
        current = target;
        raf = 0;
        if (Math.abs(video.currentTime - current) > 0.001) {
          video.currentTime = current;
        }
        return;
      }
      current += delta * LERP;
      video.currentTime = current;
      raf = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMeta = () => {
      duration = video.duration || 0;
      seedMiddle();
    };

    if (video.readyState >= 1 && video.duration) {
      onMeta();
    } else {
      video.addEventListener("loadedmetadata", onMeta);
    }

    if (reducedMotion) {
      return () => {
        video.removeEventListener("loadedmetadata", onMeta);
        if (raf) cancelAnimationFrame(raf);
      };
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!duration) return;
      const rect = frame.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      target = Math.max(0, Math.min(1, x)) * duration;
      kick();
    };

    const onLeave = () => {
      if (!duration) return;
      target = duration / 2;
      kick();
    };

    frame.addEventListener("pointermove", onMove);
    frame.addEventListener("pointerleave", onLeave);

    return () => {
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerleave", onLeave);
      video.removeEventListener("loadedmetadata", onMeta);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [frameRef, videoRef, reducedMotion]);
}
