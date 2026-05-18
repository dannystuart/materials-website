"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { deferGsap } from "@/lib/scrollTrigger";
import { useReducedMotion } from "@/components/hero/useReducedMotion";
import { LibraryVideo } from "./LibraryVideo";
import { LibraryPlateStack } from "./LibraryPlateStack";
import { LibraryTestimonial } from "./LibraryTestimonial";

export function SectionLibraryDesktop() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const q = gsap.utils.selector(root);
      const eyebrow = q('[data-reveal="eyebrow"]');
      const headlineLines = q('[data-reveal="headline-line"]');
      const video = q('[data-reveal="video"]');
      const quote = q('[data-reveal="quote"]');

      const all = [eyebrow, headlineLines, video, quote].flat();

      if (reducedMotion) {
        gsap.set(all, { opacity: 1, y: 0, clearProps: "will-change" });
        return;
      }

      gsap.set(eyebrow, { y: 20 });
      gsap.set(headlineLines, { y: 36 });
      gsap.set(video, { y: 40 });
      gsap.set(quote, { y: 32 });

      return deferGsap(() => {
        gsap
          .timeline({
            scrollTrigger: { trigger: root, start: "top 78%", once: true },
          })
          .to(eyebrow, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" })
          .to(
            headlineLines,
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.1,
            },
            "-=0.3",
          )
          .to(
            video,
            { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" },
            "-=0.55",
          );

        gsap
          .timeline({
            scrollTrigger: {
              trigger: q('[data-row="library"]')[0],
              start: "top 82%",
              once: true,
            },
          })
          .to(quote, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay: 0.25,
            ease: "power3.out",
          });
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-hero-bg pt-32 pb-40 text-white"
      aria-labelledby="library-heading"
      data-section="library"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-12">
        <header className="grid grid-cols-12 gap-x-6">
          <p
            data-reveal="eyebrow"
            className="col-span-4 col-start-1 mt-2 text-[11px] font-medium uppercase tracking-[0.28em] text-white/45"
          >
            §03 / The library
          </p>
          <h2
            id="library-heading"
            className="col-span-7 col-start-6 font-display font-semibold text-white"
            style={{
              fontSize: "60px",
              lineHeight: 1.08,
              letterSpacing: "-2.2px",
            }}
          >
            <span data-reveal="headline-line" className="block">
              <span className="library-gradient">160</span> Materials.
            </span>
            <span data-reveal="headline-line" className="block">
              One library.
            </span>
            <span
              data-reveal="headline-line"
              className="block text-white/70"
              style={{
                fontSize: "26px",
                lineHeight: 1.35,
                letterSpacing: "-0.4px",
                fontWeight: 400,
                marginTop: "18px",
              }}
            >
              Yours to apply across everything you make.
            </span>
          </h2>
        </header>
      </div>

      <div
        data-reveal="video"
        className="relative -mt-16 w-full"
        aria-hidden="true"
      >
        <LibraryVideo variant="desktop" />
      </div>

      <div
        data-row="library"
        className="relative mx-auto w-full max-w-[1440px] px-12"
        style={{ marginTop: "-180px" }}
      >
        <div className="grid grid-cols-12 gap-x-10 items-end">
          <div className="col-span-6">
            <LibraryPlateStack />
          </div>
          <div data-reveal="quote" className="col-span-5 col-start-8 pb-6">
            <LibraryTestimonial />
          </div>
        </div>
      </div>
    </section>
  );
}
