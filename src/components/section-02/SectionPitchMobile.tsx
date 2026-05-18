"use client";

import { useRef } from "react";
import { PitchHub } from "./PitchHub";
import { PitchDesignOutput, PitchAIOutput } from "./PitchOutputs";
import { PitchMobileOrbits } from "./PitchDiagram";
import { useSectionPointer } from "./useSectionPointer";
import { gsap, useGSAP } from "@/lib/gsap";
import { deferGsap } from "@/lib/scrollTrigger";
import { useReducedMotion } from "@/components/hero/useReducedMotion";

export function SectionPitchMobile() {
  const sectionRef = useRef<HTMLElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const pointer = useSectionPointer(diagramRef);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const root = sectionRef.current;
      const diagram = diagramRef.current;
      if (!root || !diagram) return;

      const q = gsap.utils.selector(root);
      const eyebrow = q('[data-reveal="eyebrow"]');
      const headlineLines = q('[data-reveal="headline-line"]');
      const lede = q('[data-reveal="lede"]');
      const orbits = q('[data-reveal="orbits"]');
      const hub = q('[data-reveal="hub"]');
      const cards = q('[data-reveal="card"]');

      const all = [eyebrow, headlineLines, lede, orbits, hub, cards].flat();

      if (reducedMotion) {
        gsap.set(all, {
          opacity: 1,
          y: 0,
          scale: 1,
          clearProps: "will-change",
        });
        return;
      }

      gsap.set([eyebrow, lede], { y: 20 });
      gsap.set(headlineLines, { y: 32 });
      gsap.set(cards, { y: 48 });
      gsap.set(hub, { scale: 0.94, transformOrigin: "50% 50%" });

      return deferGsap(() => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root,
              start: "top 82%",
              once: true,
            },
          })
          .to(eyebrow, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
          })
          .to(
            headlineLines,
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.1,
            },
            "-=0.25",
          )
          .to(
            lede,
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
            },
            "-=0.45",
          );

        gsap
          .timeline({
            scrollTrigger: {
              trigger: diagram,
              start: "top 80%",
              once: true,
            },
          })
          .to(orbits, { opacity: 1, duration: 1.0, ease: "power2.out" }, 0)
          .to(
            hub,
            {
              opacity: 1,
              scale: 1,
              duration: 0.9,
              ease: "power3.out",
            },
            0.1,
          )
          .to(
            cards,
            {
              opacity: 1,
              y: 0,
              duration: 0.85,
              ease: "power3.out",
              stagger: 0.14,
            },
            0.3,
          );
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-hero-bg px-6 py-20 text-white"
      aria-labelledby="pitch-heading-m"
      data-section="pitch"
    >
      <p
        data-reveal="eyebrow"
        className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/45"
      >
        §02 / The pitch
      </p>
      <h2
        id="pitch-heading-m"
        className="mt-4 font-display font-semibold text-white"
        style={{
          fontSize: "42px",
          lineHeight: 1.05,
          letterSpacing: "-1.4px",
        }}
      >
        <span data-reveal="headline-line" className="block">
          One <span className="gradient-word italic">Material</span>.
        </span>
        <span data-reveal="headline-line" className="block">
          Two outputs.
        </span>
      </h2>
      <p
        data-reveal="lede"
        className="mt-5 max-w-[40ch] font-display text-[15px] leading-[1.55] text-white/70"
      >
        Drop it into a design tool as a background or surface. Feed the same
        source to Midjourney as a style reference. Same library, both jobs —
        and what you ship keeps the Material&rsquo;s character.
      </p>

      <div className="relative mt-14 flex flex-col items-center gap-10">
        <div
          ref={diagramRef}
          className="relative flex aspect-square w-full max-w-[400px] items-center justify-center"
        >
          <PitchMobileOrbits pointer={pointer} />
          <div data-reveal="hub">
            <PitchHub size={260} />
          </div>
        </div>

        <div data-reveal="card" className="w-full">
          <PitchDesignOutput />
        </div>
        <div data-reveal="card" className="w-full">
          <PitchAIOutput />
        </div>
      </div>
    </section>
  );
}
