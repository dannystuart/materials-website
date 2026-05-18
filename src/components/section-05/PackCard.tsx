"use client";

import { useRef } from "react";
import { PackHalo } from "./PackHalo";
import type { Pack } from "./packData";
import { PAID_HALO, FREE_HALO } from "./packData";

type Props = { pack: Pack };

const PAID_BLOOM =
  "radial-gradient(260px circle at calc(var(--mx) + 80px) calc(var(--my) + 80px), rgba(249,115,22,0.55), rgba(168,85,247,0.18) 40%, rgba(249,115,22,0) 65%)";
const FREE_BLOOM =
  "radial-gradient(260px circle at calc(var(--mx) + 80px) calc(var(--my) + 80px), rgba(83,149,237,0.6), rgba(168,85,247,0.18) 40%, rgba(83,149,237,0) 65%)";

const PAID_EDGE =
  "radial-gradient(200px circle at var(--mx) var(--my), rgba(255,255,255,0.95), rgba(255,180,140,0.55) 35%, transparent 65%)";
const FREE_EDGE =
  "radial-gradient(200px circle at var(--mx) var(--my), rgba(255,255,255,0.95), rgba(140,180,255,0.55) 35%, transparent 65%)";

function PaidCta({ pack }: { pack: Pack }) {
  return (
    <a
      href={pack.ctaHref}
      className="relative mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-[14px] font-semibold text-[#0A0A0F]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          padding: "1px",
          background:
            "linear-gradient(90deg, rgba(249,115,22,0.9) 0%, rgba(217,70,179,0.9) 100%)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <span className="relative">{pack.ctaLabel}</span>
    </a>
  );
}

function FreeCta({ pack }: { pack: Pack }) {
  return (
    <a
      href={pack.ctaHref}
      className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full border border-white/20 bg-transparent px-5 text-[14px] font-semibold text-white"
    >
      {pack.ctaLabel}
    </a>
  );
}

export function PackCard({ pack }: Props) {
  const isPaid = pack.variant === "paid";
  const wrapRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const article = articleRef.current;
    const wrap = wrapRef.current;
    if (!article || !wrap) return;
    const rect = article.getBoundingClientRect();
    wrap.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    wrap.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={wrapRef}
      onPointerMove={handlePointerMove}
      className="group relative isolate"
      data-pack-variant={pack.variant}
      style={
        {
          "--mx": "50%",
          "--my": "50%",
        } as React.CSSProperties
      }
    >
      <PackHalo
        className="absolute -inset-[35%] -z-10"
        palette={isPaid ? PAID_HALO : FREE_HALO}
        restingIntensity={isPaid ? 0.6 : 0.3}
        viewBox={[2, 2]}
        center={[1, 1]}
        radii={[0.55, 0.85, 1.25]}
        phaseOffset={isPaid ? 0 : 0.5}
      />

      {/* Behind-card bloom — tracks cursor, blooms beyond the card edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-20 -z-[5] opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 motion-reduce:transition-none"
        style={{
          background: isPaid ? PAID_BLOOM : FREE_BLOOM,
          filter: "blur(46px)",
        }}
      />

      <article
        ref={articleRef}
        className="relative rounded-[20px] border border-white/[0.07] bg-[rgba(14,14,16,0.92)] p-8 font-display text-white transition-transform duration-[1100ms] will-change-transform [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.055] group-hover:border-white/[0.18] motion-reduce:transform-none motion-reduce:transition-none"
      >
        <div className="text-[12px] font-medium uppercase tracking-[0.14em] text-white/60">
          {pack.catalogHeader}
        </div>

        <div className="mt-6">
          <h3 className="text-[32px] font-semibold leading-tight tracking-[-0.01em] text-white/85 transition-colors duration-500 ease-out group-hover:text-white">
            {pack.name}
          </h3>
          <p className="mt-2 text-[14px] leading-snug text-white/65 transition-colors duration-500 ease-out group-hover:text-white/90">
            {pack.tagline}
          </p>
        </div>

        <div className="mt-8">
          <div className="text-[44px] font-semibold leading-none">
            {pack.price}
          </div>
          {pack.priceStrap ? (
            <div className="mt-1 text-[12px] text-white/55">{pack.priceStrap}</div>
          ) : null}
        </div>

        <ul className="mt-8 flex flex-col gap-2">
          {pack.inventory.map((item) => (
            <li
              key={item.text}
              className="flex items-start gap-3 text-[14px] leading-snug text-white/85"
            >
              <span aria-hidden="true" className="shrink-0">
                {item.emoji}
              </span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>

        {isPaid ? <PaidCta pack={pack} /> : <FreeCta pack={pack} />}

        {/* Lit edge — radial highlight masked to a 1px border, tracks cursor */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[20px] opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 motion-reduce:transition-none"
          style={{
            padding: "1px",
            background: isPaid ? PAID_EDGE : FREE_EDGE,
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      </article>
    </div>
  );
}
