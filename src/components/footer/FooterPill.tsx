"use client";

import type { CSSProperties } from "react";

const rootStyle = {
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  backdropFilter: "blur(20px) saturate(140%)",
} as CSSProperties;

const linkClass =
  "inline-flex items-center gap-1 py-3 lg:py-0 font-medium text-white/85 hover:text-white transition-colors focus:outline-none focus-visible:text-white";

const dividerClass = "h-5 w-px bg-white/12";

export function FooterPill() {
  return (
    <div
      className="
        flex items-center
        h-11 md:h-12 pl-3 md:pl-4 pr-3 md:pr-4
        rounded-full
        bg-[rgba(8,8,12,0.72)]
        shadow-[0_10px_40px_rgba(0,0,0,0.5)]
      "
      style={rootStyle}
    >
      <nav
        aria-label="Site"
        className="flex items-center gap-3 md:gap-4 text-[13px] md:text-[14px]"
      >
        <span className="hidden md:inline font-medium text-white/55 select-none whitespace-nowrap">
          Made by Danny Stuart
        </span>

        <span aria-hidden="true" className={`hidden md:block ${dividerClass}`} />

        <a
          href="https://dannystuart.com"
          target="_blank"
          rel="noreferrer noopener"
          className={linkClass}
        >
          <span className="md:hidden">Site</span>
          <span className="hidden md:inline">dannystuart.com</span>
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
      </nav>
    </div>
  );
}
