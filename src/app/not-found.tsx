import Link from "next/link";

export default function NotFound() {
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
          404 / Nf / not found
        </p>

        <h1 className="t-display mt-6 text-white">
          This page slipped the catalog.
        </h1>

        <p className="t-lead mt-5 max-w-md text-white/70">
          Nothing filed under that address. The library is still where you left it.
        </p>

        <Link
          href="/"
          className="mt-10 inline-flex min-h-11 items-center text-white underline decoration-white/35 decoration-1 underline-offset-[6px] transition-colors hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgba(83,149,237,0.9)]"
        >
          Back to the library
        </Link>
      </div>
    </main>
  );
}
