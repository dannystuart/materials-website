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

export function SectionRecipeMobile() {
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
      { threshold: 0.2 },
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
      const tiles = q('[data-reveal="tile"]');
      const ops = q('[data-reveal="op"]');

      const all = [eyebrow, headlineLines, tiles, ops].flat();

      if (reducedMotion) {
        gsap.set(all, { opacity: 1, y: 0, clearProps: "will-change" });
        return;
      }

      gsap.set(eyebrow, { y: 16 });
      gsap.set(headlineLines, { y: 24 });
      gsap.set(tiles, { y: 28 });

      return deferGsap(() => {
        gsap
          .timeline({
            scrollTrigger: { trigger: root, start: "top 85%", once: true },
          })
          .to(eyebrow, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" })
          .to(
            headlineLines,
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.08,
            },
            "-=0.25",
          );

        gsap
          .timeline({
            scrollTrigger: {
              trigger: rowRef.current,
              start: "top 90%",
              once: true,
            },
          })
          .to(tiles, {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.12,
          })
          .to(
            ops,
            { opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.1 },
            "-=0.45",
          );
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  const activeMaterial = materials[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-hero-bg pt-20 pb-24 text-white"
      aria-labelledby="recipe-heading-mobile"
      data-section="recipe"
    >
      <RecipeGradient />

      <div className="relative px-6">
        <p
          data-reveal="eyebrow"
          className="text-[10px] font-medium uppercase tracking-[0.26em] text-white/45"
        >
          §04 / The recipe
        </p>
        <h2
          id="recipe-heading-mobile"
          className="mt-5 font-display font-semibold text-white"
          style={{
            fontSize: "36px",
            lineHeight: 1.1,
            letterSpacing: "-1.2px",
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
      </div>

      <div
        ref={rowRef}
        className="relative mt-12 flex flex-col items-stretch gap-3 px-6"
        data-row="recipe"
      >
        <div data-reveal="tile">
          <RecipeInputType
            phrase={phrase}
            typed={typed}
            typingDone={typingDone}
            variant="mobile"
          />
        </div>
        <div
          data-reveal="op"
          className="flex justify-center"
          style={{ marginTop: -4, marginBottom: -4 }}
        >
          <RecipeOperator symbol="+" size="md" />
        </div>
        <div data-reveal="tile" className="self-center">
          <RecipeCarousel
            materials={materials}
            activeIndex={activeIndex}
            variant="mobile"
          />
        </div>
        <div
          data-reveal="op"
          className="flex justify-center"
          style={{ marginTop: -4, marginBottom: -4 }}
        >
          <RecipeOperator symbol="=" size="md" />
        </div>
        <div data-reveal="tile">
          <RecipeOutput material={activeMaterial} variant="mobile" />
        </div>
      </div>
    </section>
  );
}
