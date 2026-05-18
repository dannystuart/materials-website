"use client";

import { useRef } from "react";
import { clsx } from "@/lib/clsx";

type Props = {
  label: string;
  caption: string;
  children: React.ReactNode;
  className?: string;
  /** Resting scale of the inner image. Hover adds ~0.1. Default 1.5. */
  imageScale?: number;
};

const NOISE_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export function PitchOutputFigure({
  label,
  caption,
  children,
  className,
  imageScale = 1.15,
}: Props) {
  const restScale = imageScale;
  const hoverScale = +(imageScale + 0.1).toFixed(3);
  const figureRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
    const card = cardRef.current;
    const fig = figureRef.current;
    if (!card || !fig) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    fig.style.setProperty("--mx", `${x}px`);
    fig.style.setProperty("--my", `${y}px`);
  }

  return (
    <figure
      ref={figureRef}
      onPointerMove={handlePointerMove}
      className={clsx(
        "group relative font-display text-white",
        className,
      )}
      data-pitch-output
      style={
        {
          "--mx": "50%",
          "--my": "50%",
        } as React.CSSProperties
      }
    >
      {/* Behind-card halo — tracks cursor, blooms beyond the card edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-20 -z-10 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(260px circle at calc(var(--mx) + 80px) calc(var(--my) + 80px), rgba(83,149,237,0.6), rgba(168,85,247,0.18) 40%, rgba(83,149,237,0) 65%)",
          filter: "blur(46px)",
        }}
      />

      {/* Card */}
      <div
        ref={cardRef}
        className={clsx(
          "relative isolate overflow-hidden rounded-[20px]",
          "border border-white/[0.07]",
          "transition-all duration-[1100ms] will-change-transform",
          "[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
          "group-hover:scale-[1.055] group-hover:border-white/[0.18]",
        )}
        style={{
          backgroundImage: [
            "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 9%)",
            "radial-gradient(140% 70% at 100% 0%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 40%)",
            "radial-gradient(140% 70% at 0% 100%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 45%)",
            "linear-gradient(180deg, rgba(30,30,34,0.85) 0%, rgba(14,14,16,0.92) 100%)",
          ].join(", "),
          boxShadow: [
            "inset 0 1px 0 0 rgba(255,255,255,0.10)",
            "inset 0 -1px 0 0 rgba(0,0,0,0.45)",
            "0 10px 22px -8px rgba(0,0,0,0.8)",
            "0 36px 64px -18px rgba(0,0,0,0.85)",
            "0 100px 180px -48px rgba(0,0,0,0.75)",
          ].join(", "),
        }}
      >
        {/* Noise texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.22] mix-blend-overlay"
          style={{
            backgroundImage: NOISE_SVG,
            backgroundSize: "240px 240px",
          }}
        />

        {/* Image area — children scaled + tilted, then clipped by this box */}
        <div className="relative aspect-[5/4] w-full overflow-hidden">
          <div
            className="absolute -inset-[18%] origin-center [transform:rotate(-4deg)_scale(var(--rest))] transition-transform duration-[1100ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:[transform:rotate(-2.5deg)_scale(var(--hov))]"
            style={
              {
                "--rest": String(restScale),
                "--hov": String(hoverScale),
              } as React.CSSProperties
            }
          >
            {children}
          </div>
        </div>

        {/* Text content inside the card */}
        <div className="relative z-20 flex flex-col gap-2 px-5 pb-5 pt-5">
          <div className="font-display text-[20px] font-semibold leading-tight tracking-[-0.01em] text-white/85 transition-colors duration-500 ease-out group-hover:text-white">
            {label}
          </div>
          <div className="max-w-[34ch] text-[13px] leading-snug text-white/65 transition-colors duration-500 ease-out group-hover:text-white/90">
            {caption}
          </div>
        </div>

        {/* Stroke glow — light traveling around the border at cursor position */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 rounded-[20px] opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
          style={{
            padding: "1px",
            background:
              "radial-gradient(200px circle at var(--mx) var(--my), rgba(255,255,255,0.95), rgba(140,180,255,0.55) 35%, transparent 65%)",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      </div>
    </figure>
  );
}
