"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error to the console / any attached reporting.
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-start justify-center overflow-hidden bg-hero-bg px-6 py-24 sm:px-10 lg:px-16">
      {/* Atmosphere — the single cool-blue glow, bottom-anchored */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 100%, rgba(83,149,237,0.28) 0%, rgba(83,149,237,0) 70%)",
        }}
      />

      <div className="w-full max-w-xl">
        <p aria-hidden="true" className="t-caps text-white/55">
          500 / Er / error
        </p>

        <h1 className="t-display mt-6 text-white">
          Something came loose.
        </h1>

        <p className="t-lead mt-5 max-w-md text-white/70">
          That one is on us — the page hit a snag on the way out. Give it another go.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-11 items-center text-white underline decoration-white/35 decoration-1 underline-offset-[6px] transition-colors hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgba(83,149,237,0.9)]"
          >
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-white/70 underline decoration-white/35 decoration-1 underline-offset-[6px] transition-colors hover:text-white hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgba(83,149,237,0.9)]"
          >
            Back to the library
          </Link>
        </div>
      </div>
    </main>
  );
}
