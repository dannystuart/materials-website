"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { deferGsap } from "@/lib/scrollTrigger";
import { useReducedMotion } from "@/components/hero/useReducedMotion";
import { LibraryVideo } from "./LibraryVideo";
import { LibraryPlateStack } from "./LibraryPlateStack";
import { LibraryTestimonial } from "./LibraryTestimonial";

export function SectionLibraryMobile() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const q = gsap.utils.selector(root);
      const all = [
        q('[data-reveal="eyebrow"]'),
        q('[data-reveal="headline-line"]'),
        q('[data-reveal="video"]'),
        q('[data-reveal="quote"]'),
      ].flat();

      if (reducedMotion) {
        gsap.set(all, { opacity: 1, y: 0, clearProps: "will-change" });
        return;
      }

      gsap.set(q('[data-reveal="eyebrow"]'), { y: 16 });
      gsap.set(q('[data-reveal="headline-line"]'), { y: 24 });
      gsap.set(q('[data-reveal="video"]'), { y: 24 });
      gsap.set(q('[data-reveal="quote"]'), { y: 24 });

      return deferGsap(() => {
        gsap
          .timeline({
            scrollTrigger: { trigger: root, start: "top 85%", once: true },
          })
          .to(q('[data-reveal="eyebrow"]'), {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
          })
          .to(
            q('[data-reveal="headline-line"]'),
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.08,
            },
            "-=0.25",
          )
          .to(
            q('[data-reveal="video"]'),
            { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
            "-=0.45",
          );

        gsap
          .timeline({
            scrollTrigger: {
              trigger: q('[data-row="library"]')[0],
              start: "top 90%",
              once: true,
            },
          })
          .to(q('[data-reveal="quote"]'), {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.3,
            ease: "power3.out",
          });
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-hero-bg pt-20 pb-24 text-white"
      aria-labelledby="library-heading-mobile"
      data-section="library"
    >
      <header className="relative z-10 px-6">
        <p
          data-reveal="eyebrow"
          className="text-[10px] font-medium uppercase tracking-[0.26em] text-white/45"
        >
          §03 / The library
        </p>
        <h2
          id="library-heading-mobile"
          className="mt-3 font-display font-semibold text-white"
          style={{
            fontSize: "36px",
            lineHeight: 1.1,
            letterSpacing: "-1.2px",
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
              fontSize: "20px",
              lineHeight: 1.35,
              letterSpacing: "-0.3px",
              fontWeight: 400,
              marginTop: "12px",
            }}
          >
            Yours to apply across everything you make.
          </span>
        </h2>
      </header>

      <div data-reveal="video" className="relative -mt-8 w-full">
        <LibraryVideo variant="mobile" />
      </div>

      <div
        data-row="library"
        className="relative mt-[-60px] flex flex-col gap-12 px-6"
      >
        <div>
          <LibraryPlateStack compact />
        </div>
        <div data-reveal="quote">
          <LibraryTestimonial />
        </div>
      </div>
    </section>
  );
}
