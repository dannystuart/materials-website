"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "@/lib/clsx";
import { gsap, useGSAP } from "@/lib/gsap";
import { deferGsap } from "@/lib/scrollTrigger";
import { useReducedMotion } from "@/components/hero/useReducedMotion";
import { RecipeGradient } from "./RecipeGradient";
import { RecipeInputType } from "./RecipeInputType";
import { RecipeCarousel } from "./RecipeCarousel";
import { RecipeOutput } from "./RecipeOutput";
import { RecipeOperator } from "./RecipeOperator";
import { useRecipeDemo } from "./useRecipeDemo";

const HEADLINE_TYPED = "Type something.";
const HEADLINE_TYPE_CHAR_MS = 60;
const HEADLINE_TYPE_HOLD_MS = 400;
const HEADLINE_TYPING_DURATION_S =
  (HEADLINE_TYPED.length * HEADLINE_TYPE_CHAR_MS + HEADLINE_TYPE_HOLD_MS) /
  1000;

export function SectionRecipeMobile() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [demoStarted, setDemoStarted] = useState(false);
  const [headlineTypingStarted, setHeadlineTypingStarted] = useState(false);
  const [typedHeadline, setTypedHeadline] = useState("");
  const [headlineTypingDone, setHeadlineTypingDone] = useState(false);
  const { phrase, typed, typingDone, activeIndex, materials } = useRecipeDemo({
    start: demoStarted,
    reducedMotion,
  });

  useEffect(() => {
    if (reducedMotion) return;
    if (!headlineTypingStarted) return;

    let cancelled = false;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      i += 1;
      setTypedHeadline(HEADLINE_TYPED.slice(0, i));
      if (i < HEADLINE_TYPED.length) {
        window.setTimeout(tick, HEADLINE_TYPE_CHAR_MS);
      } else {
        window.setTimeout(() => {
          if (cancelled) return;
          setHeadlineTypingDone(true);
        }, HEADLINE_TYPE_HOLD_MS);
      }
    };
    const startTimer = window.setTimeout(tick, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
    };
  }, [headlineTypingStarted, reducedMotion]);

  const displayedHeadline = reducedMotion ? HEADLINE_TYPED : typedHeadline;
  const showCaret = !reducedMotion;
  const caretIsDone = headlineTypingDone;

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
      const headlineLineFirst = headlineLines.slice(0, 1);
      const headlineLinesRest = headlineLines.slice(1);
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
            headlineLineFirst,
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power3.out",
              onStart: () => setHeadlineTypingStarted(true),
            },
            "-=0.25",
          )
          .to(
            headlineLinesRest,
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.08,
            },
            `+=${HEADLINE_TYPING_DURATION_S - 0.2}`,
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
          className="t-caps text-white/45"
        >
          §04 / The recipe
        </p>
        <h2
          id="recipe-heading-mobile"
          className="mt-5 t-display text-white"
        >
          <span
            data-reveal="headline-line"
            className="block"
            aria-label={HEADLINE_TYPED}
          >
            <span aria-hidden="true">{displayedHeadline}</span>
            {showCaret && (
              <span
                aria-hidden="true"
                className={clsx(
                  "recipe-caret",
                  caretIsDone && "recipe-caret--done",
                )}
              />
            )}
          </span>
          <span data-reveal="headline-line" className="block">
            Pick a <span className="material-shimmer">Material</span>.
          </span>
          <span
            data-reveal="headline-line"
            className="block text-white/70 font-normal"
          >
            That&rsquo;s the whole recipe.
          </span>
        </h2>
      </div>

      {/* overflow-x:auto silently promotes overflow-y to auto, so we clip Y
          to keep this row horizontal-only (same fix as the §02 carousel). */}
      <div
        ref={rowRef}
        className="no-scrollbar relative mt-12 flex items-center gap-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-px-6 px-6"
        data-row="recipe"
      >
        <div
          data-reveal="tile"
          className="w-[78vw] max-w-[300px] min-w-0 shrink-0 snap-center"
        >
          <RecipeInputType
            phrase={phrase}
            typed={typed}
            typingDone={typingDone}
            variant="mobile"
          />
        </div>
        <div data-reveal="op" className="shrink-0">
          <RecipeOperator symbol="+" size="md" />
        </div>
        <div data-reveal="tile" className="shrink-0 snap-center">
          <RecipeCarousel
            materials={materials}
            activeIndex={activeIndex}
            variant="mobile"
          />
        </div>
        <div data-reveal="op" className="shrink-0">
          <RecipeOperator symbol="=" size="md" />
        </div>
        <div
          data-reveal="tile"
          className="w-[78vw] max-w-[300px] min-w-0 shrink-0 snap-center"
        >
          <RecipeOutput material={activeMaterial} variant="mobile" />
        </div>
      </div>

      <p className="mt-4 px-6 t-caption text-white/45">
        Scroll to see the result{" "}
        <span data-recipe-arrow aria-hidden="true" className="recipe-scroll-arrow inline-block">
          &rarr;
        </span>
      </p>
    </section>
  );
}
