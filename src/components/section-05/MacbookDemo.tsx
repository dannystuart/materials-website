"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

  // Deferred buffering. §05 is the last section, so the whole scroll journey is
  // free runway to fetch the (large, native-res) demo. Start at "metadata" — the
  // scrub setup only needs video.duration — so the 40MB+ file never competes
  // with the hero at page load. Warm to "auto" once the user is ~1.5 viewports
  // away, by which point it buffers ahead of arrival. The scrub itself only ever
  // seeks the first ~2s, and the file is faststart + range-served, so even an
  // un-warmed scrub stays smooth; warming pre-buffers the longer play-out phase.
  const [warmed, setWarmed] = useState(false);
  useEffect(() => {
    const block = blockRef.current;
    if (!block || warmed) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setWarmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px 150% 0px" },
    );
    io.observe(block);
    return () => io.disconnect();
  }, [warmed]);

  const preload = warmed ? "auto" : "metadata";
  const sources =
    variant === "desktop"
      ? [{ src: "/videos/macbook-demo.mp4", type: "video/mp4" }]
      : [{ src: "/videos/macbook-demo-720.mp4", type: "video/mp4" }];

  // Desktop: the caption overlays the upper band of the video frame (the empty
  // space above the closed lid that the screen swings up into). This keeps the
  // heading visually attached to the demo — no gap — and lets the opening lid
  // push it off the top. Mobile keeps the caption in normal flow above the
  // frame (no rise-off / toggle there, so it must never overlap the screen).
  const captionPosition =
    variant === "desktop"
      ? "absolute inset-x-0 top-0 z-20 px-6 pt-[150px] text-center"
      : "relative z-10 px-6 pt-20 pb-16 text-center";

  // Desktop centres the 16:9 crop in its 2:1 pinned frame so the open laptop
  // sits central while the lid pushes the caption off the top. Mobile uses a
  // taller 3:2 frame and scales the source up so the laptop reads near-full
  // width — its base bleeds past the viewport edges while the central laptop
  // (the opening) stays large and centred (object-center keeps it framed).
  const frameAspect = variant === "desktop" ? "aspect-[2/1]" : "aspect-[3/2]";
  const videoSizing =
    variant === "desktop"
      ? "object-center"
      : "object-center scale-[1.5] origin-center";

  return (
    <div
      ref={blockRef}
      className="relative w-full bg-hero-bg"
      data-macbook-demo
    >
      <div
        data-demo-caption={reduced ? "static" : "motion"}
        className={`pointer-events-none ${captionPosition}${
          reduced ? "" : " will-change-transform"
        }`}
      >
        <span
          data-demo-caption-eyebrow
          className="t-caps text-white/70"
        >
          APPLIED
        </span>
        <p
          data-demo-caption-line
          className="mt-2 text-balance t-display text-white"
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

      <div className={`relative ${frameAspect} w-full overflow-hidden`}>
        <video
          ref={videoRef}
          className={`h-full w-full object-cover ${videoSizing}`}
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
