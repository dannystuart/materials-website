"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { deferGsap } from "@/lib/scrollTrigger";
import { useReducedMotion } from "@/components/hero/useReducedMotion";
import { RecipeGradient } from "./RecipeGradient";
import { RecipeInputType } from "./RecipeInputType";
import { RecipeCarousel } from "./RecipeCarousel";
import { RecipeOutput } from "./RecipeOutput";
import { RecipeOperator } from "./RecipeOperator";
import { useRecipeDemo } from "./useRecipeDemo";

export function SectionRecipeDesktop() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [demoStarted, setDemoStarted] = useState(false);
  const { phrase, typed, typingDone, activeIndex, materials } = useRecipeDemo({
    start: demoStarted,
    reducedMotion,
  });

  useEffect(() => {
    const target = rowRef.current;
    if (!target) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setDemoStarted(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px 0px 0px" },
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const q = gsap.utils.selector(root);
      const eyebrow = q('[data-reveal="eyebrow"]');
      const headlineLines = q('[data-reveal="headline-line"]');
      const lede = q('[data-reveal="lede"]');
      const tiles = q('[data-reveal="tile"]');
      const ops = q('[data-reveal="op"]');

      const all = [eyebrow, headlineLines, lede, tiles, ops].flat();

      if (reducedMotion) {
        gsap.set(all, { opacity: 1, y: 0, clearProps: "will-change" });
        return;
      }

      gsap.set(eyebrow, { y: 20 });
      gsap.set(headlineLines, { y: 36 });
      gsap.set(lede, { y: 24 });
      gsap.set(tiles, { y: 40 });

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
            lede,
            { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
            "-=0.55",
          );

        gsap
          .timeline({
            scrollTrigger: {
              trigger: rowRef.current,
              start: "top 82%",
              once: true,
            },
          })
          .to(tiles, {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.12,
          })
          .to(
            ops,
            { opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.12 },
            "-=0.55",
          );
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  const activeMaterial = materials[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-hero-bg pt-32 pb-40 text-white"
      aria-labelledby="recipe-heading"
      data-section="recipe"
    >
      <RecipeGradient />

      <div className="relative mx-auto w-full max-w-[1440px] px-12">
        <header className="grid grid-cols-12 gap-x-6">
          <p
            data-reveal="eyebrow"
            className="col-span-12 text-[11px] font-medium uppercase tracking-[0.28em] text-white/45"
          >
            §04 / The recipe
          </p>
          <h2
            id="recipe-heading"
            className="col-span-7 mt-6 font-display font-semibold text-white"
            style={{
              fontSize: "60px",
              lineHeight: 1.08,
              letterSpacing: "-2.2px",
            }}
          >
            <span data-reveal="headline-line" className="block">
              Type something.
            </span>
            <span data-reveal="headline-line" className="block">
              Pick a Material.
            </span>
            <span
              data-reveal="headline-line"
              className="block text-white/70"
              style={{ fontWeight: 400 }}
            >
              That&rsquo;s the whole recipe.
            </span>
          </h2>
          <p
            data-reveal="lede"
            className="col-span-5 col-start-8 mt-8 max-w-[44ch] self-end font-display text-[18px] leading-[1.55] text-white/70"
          >
            Materials work as fills. Drop one onto type, vectors, or photos —
            same workflow, every tool you already use.
          </p>
        </header>

        <div
          ref={rowRef}
          className="relative mt-20 flex w-full items-center justify-between gap-4"
          data-row="recipe"
        >
          <div data-reveal="tile" className="w-[340px] shrink-0">
            <RecipeInputType
              phrase={phrase}
              typed={typed}
              typingDone={typingDone}
              variant="desktop"
            />
          </div>
          <div data-reveal="op" className="shrink-0 px-2">
            <RecipeOperator symbol="+" size="lg" />
          </div>
          <div data-reveal="tile" className="shrink-0">
            <RecipeCarousel
              materials={materials}
              activeIndex={activeIndex}
              variant="desktop"
            />
          </div>
          <div data-reveal="op" className="shrink-0 px-2">
            <RecipeOperator symbol="=" size="lg" />
          </div>
          <div data-reveal="tile" className="w-[340px] shrink-0">
            <RecipeOutput material={activeMaterial} variant="desktop" />
          </div>
        </div>
      </div>
    </section>
  );
}
