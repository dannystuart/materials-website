"use client";

import type { CSSProperties } from "react";

const rootStyle = {
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  backdropFilter: "blur(20px) saturate(140%)",
} as CSSProperties;

const linkClass =
  "inline-flex items-center gap-1 py-3 md:py-0 font-medium whitespace-nowrap text-white/85 hover:text-white transition-colors focus:outline-none focus-visible:text-white";

const dividerClass = "h-5 w-px bg-white/12";

export function FooterPill() {
  return (
    <div
      className="
        flex items-center
        py-1.5 md:py-0 px-3.5 md:px-4 h-auto md:h-12
        rounded-3xl md:rounded-full
        bg-[rgba(8,8,12,0.72)]
        shadow-[0_10px_40px_rgba(0,0,0,0.5)]
      "
      style={rootStyle}
    >
      {/* Mobile carries the same content as the desktop original (the full
          "Made by Danny Stuart" attribution + real domain, not a stripped
          "Site" link), stacked onto two rows: attribution on top, the three
          links on one row below. The link group is `flex` on mobile (its own
          full-width row, kept to a single line) and `md:contents` on desktop,
          where it flattens back into the nav's single flat row — so desktop
          stays pixel-identical. */}
      <nav
        aria-label="Site"
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 md:gap-y-0 text-[13px] md:text-[14px]"
      >
        <span className="font-medium text-white/55 select-none whitespace-nowrap">
          Made by Danny Stuart
        </span>

        <span aria-hidden="true" className={`hidden md:block ${dividerClass}`} />

        <div className="flex basis-full items-center justify-center gap-x-2 md:contents md:basis-auto">
          <a
            href="https://dannystuart.com"
            target="_blank"
            rel="noreferrer noopener"
            className={linkClass}
          >
            <span>dannystuart.com</span>
            <span aria-hidden="true">→</span>
          </a>

          <span aria-hidden="true" className={dividerClass} />

          <a
            href="https://www.threads.net/@dannystuart"
            target="_blank"
            rel="noreferrer noopener"
            className={linkClass}
          >
            <span>Threads</span>
            <span aria-hidden="true">→</span>
          </a>

          <span aria-hidden="true" className={dividerClass} />

          <a href="mailto:hi@dannystuart.com" className={linkClass}>
            <span>Say hi</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
