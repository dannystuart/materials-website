"use client";

import { useEffect, useRef } from "react";
import { PitchHub } from "./PitchHub";
import { PitchDesignOutput, PitchAIOutput } from "./PitchOutputs";
import { PitchDiagramBackground } from "./PitchDiagram";
import { useSectionPointer } from "./useSectionPointer";
import { gsap, useGSAP } from "@/lib/gsap";
import { deferGsap } from "@/lib/scrollTrigger";
import { useReducedMotion } from "@/components/hero/useReducedMotion";

export function SectionPitchDesktop() {
  const sectionRef = useRef<HTMLElement>(null);
  const scaleWrapRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const pointer = useSectionPointer(diagramRef);
  const reducedMotion = useReducedMotion();

  // Scale the fixed 1344-wide diagram down to fit the available column so the
  // right-hand card never runs off-screen below 1440px. Caps at 1.0.
  useEffect(() => {
    const wrap = scaleWrapRef.current;
    if (!wrap) return;
    const apply = () => {
      const scale = Math.min(1, wrap.clientWidth / 1344);
      wrap.style.setProperty("--pitch-scale", String(scale));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

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
      const connectors = q('[data-reveal="connector"]');
      const meta = q('[data-reveal="diagram-meta"]');

      const all = [
        eyebrow,
        headlineLines,
        lede,
        orbits,
        hub,
        cards,
        connectors,
        meta,
      ].flat();

      if (reducedMotion) {
        gsap.set(all, {
          opacity: 1,
          y: 0,
          scale: 1,
          clearProps: "will-change",
        });
        return;
      }

      gsap.set([eyebrow, lede], { y: 24 });
      gsap.set(headlineLines, { y: 44 });
      gsap.set(cards, { y: 56 });
      gsap.set(hub, { scale: 0.92, transformOrigin: "50% 50%" });

      return deferGsap(() => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root,
              start: "top 80%",
              once: true,
            },
          })
          .to(eyebrow, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
          })
          .to(
            headlineLines,
            {
              opacity: 1,
              y: 0,
              duration: 0.95,
              ease: "power3.out",
              stagger: 0.12,
            },
            "-=0.35",
          )
          .to(
            lede,
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
            },
            "-=0.55",
          );

        gsap
          .timeline({
            scrollTrigger: {
              trigger: diagram,
              start: "top 78%",
              once: true,
            },
          })
          .to(
            orbits,
            {
              opacity: 1,
              duration: 1.2,
              ease: "power2.out",
            },
            0,
          )
          .to(
            hub,
            {
              opacity: 1,
              scale: 1,
              duration: 1.0,
              ease: "power3.out",
            },
            0.12,
          )
          .to(
            connectors,
            {
              opacity: 1,
              duration: 0.7,
              ease: "power2.out",
              stagger: 0.16,
            },
            0.35,
          )
          .to(
            cards,
            {
              opacity: 1,
              y: 0,
              duration: 0.95,
              ease: "power3.out",
              stagger: 0.14,
            },
            0.3,
          )
          .to(
            meta,
            {
              opacity: 1,
              duration: 0.6,
              ease: "power2.out",
            },
            0.7,
          );
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-hero-bg pt-32 pb-40 text-white"
      aria-labelledby="pitch-heading"
      data-section="pitch"
    >
      <div className="relative mx-auto w-full max-w-[1440px] px-12">
        <header className="grid grid-cols-12 gap-x-6">
          <p
            data-reveal="eyebrow"
            className="col-span-12 t-caps text-white/45"
          >
            §02 / The pitch
          </p>
          <h2
            id="pitch-heading"
            className="col-span-6 mt-6 t-mega text-white"
          >
            <span data-reveal="headline-line" className="block">
              One <span className="gradient-word">Material</span>.
            </span>
            <span data-reveal="headline-line" className="block">
              Two outputs.
            </span>
          </h2>
          <p
            data-reveal="lede"
            className="col-span-5 col-start-8 mt-8 max-w-[44ch] self-end t-body text-white/70"
          >
            Drop it into a design tool as a background or surface. Feed the
            same source to Midjourney as a style reference. Same library, both
            jobs.
          </p>
        </header>

        {/* Scale-to-fit wrapper: the diagram is authored in a fixed
            1344×680 coordinate space (cards absolutely positioned against
            it). The wrapper's width tracks the available column; a
            ResizeObserver (see effect above) sets --pitch-scale = column /
            1344 (capped at 1) and the inner box scales by it, so cards,
            connectors and orbits stay locked together at every viewport from
            768px up. The aspect-ratio reserves the scaled height so the
            transformed box leaves no gap or overflow. */}
        <div
          ref={scaleWrapRef}
          className="relative mt-30 w-full"
          style={{ aspectRatio: "1344 / 680" }}
        >
          <div
            ref={diagramRef}
            className="absolute top-0 left-0 origin-top-left"
            style={{
              height: "680px",
              width: "1344px",
              transform: "scale(var(--pitch-scale, 1))",
            }}
          >
            <PitchDiagramBackground pointer={pointer} />

            <div
              data-reveal="card"
              className="absolute"
              style={{ top: "8px", left: "0px", width: "360px" }}
            >
              <PitchDesignOutput />
            </div>

            <div
              data-reveal="hub"
              className="absolute"
              style={{ top: "120px", left: "512px", width: "320px" }}
            >
              <PitchHub size={320} />
            </div>

            <div
              data-reveal="card"
              className="absolute"
              style={{ top: "280px", right: "0px", width: "360px" }}
            >
              <PitchAIOutput />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
