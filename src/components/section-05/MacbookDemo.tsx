"use client";

import { useCallback, useRef, useState } from "react";
import { useReducedMotion } from "../hero/useReducedMotion";
import { useMacbookScrub } from "./useMacbookScrub";

type Props = { variant: "desktop" | "mobile" };

const CAPTION_WORDS = ["A", "few", "Materials,", "on", "real", "work."];

export function MacbookDemo({ variant }: Props) {
  const blockRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reduced = useReducedMotion();
  const [overlayShown, setOverlayShown] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Reduced motion shows the overlay (the play button) instead of the scrubbed
  // demo. Seed it during render — the documented "adjust state during render"
  // pattern — tracking the previous `reduced` value in state so the overlay is
  // forced on whenever `reduced` flips true (including on first render, since
  // the tracker starts at false). Handlers own the false→true→false toggles.
  const [prevReduced, setPrevReduced] = useState(false);
  if (prevReduced !== reduced) {
    setPrevReduced(reduced);
    if (reduced) setOverlayShown(true);
  }

  const handleScrubComplete = useCallback(() => {
    setHasPlayed(true);
  }, []);

  useMacbookScrub({
    blockRef,
    videoRef,
    enabled: !reduced,
    onScrubComplete: handleScrubComplete,
  });

  const handleEnded = useCallback(() => {
    setOverlayShown(true);
  }, []);

  const handlePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setOverlayShown(false);
    setHasPlayed(true);
    video.currentTime = 0;
    void video.play().catch(() => {});
  }, []);

  const preload = variant === "desktop" ? "auto" : "metadata";
  const sources =
    variant === "desktop"
      ? [{ src: "/videos/macbook-demo.mp4", type: "video/mp4" }]
      : [{ src: "/videos/macbook-demo-720.mp4", type: "video/mp4" }];

  return (
    <div
      ref={blockRef}
      className="relative w-full bg-hero-bg"
      data-macbook-demo
    >
      <div className="relative aspect-[2/1] w-full overflow-hidden">
        <video
          ref={videoRef}
          className="h-full w-full object-cover object-bottom"
          muted
          playsInline
          preload={preload}
          poster="/videos/macbook-demo-poster.jpg"
          onEnded={handleEnded}
          aria-label="Materials¹ product demo"
        >
          {sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>

        <div
          data-demo-caption={reduced ? "static" : "motion"}
          aria-hidden={!reduced || undefined}
          className={
            reduced
              ? "pointer-events-none absolute left-6 top-6 z-10 flex flex-col gap-2 text-left"
              : "pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center"
          }
        >
          <span
            data-demo-caption-eyebrow
            className="font-display text-[11px] font-medium uppercase tracking-[0.28em] text-white/70"
          >
            APPLIED
          </span>
          <p
            data-demo-caption-line
            className="font-display text-3xl font-semibold leading-[1.15] tracking-[-0.0334em] text-white md:text-[40px]"
          >
            {CAPTION_WORDS.map((word, i) => (
              <span
                key={i}
                data-demo-caption-word
                className="mr-[0.25em] inline-block"
              >
                {word}
              </span>
            ))}
          </p>
        </div>

        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/40 transition-opacity duration-300 ${
            overlayShown ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!overlayShown}
        >
          <p className="font-display text-2xl font-semibold text-white">
            {hasPlayed ? "Want another look?" : "See the workflow."}
          </p>
          <button
            type="button"
            onClick={handlePlay}
            className="rounded-full bg-white px-6 py-3 font-display text-base font-semibold text-black transition-transform hover:scale-[1.03]"
          >
            {hasPlayed ? "Replay demo" : "Play demo"}
          </button>
        </div>
      </div>
    </div>
  );
}
