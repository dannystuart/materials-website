"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { deferGsap } from "@/lib/scrollTrigger";
import { useReducedMotion } from "@/components/hero/useReducedMotion";
import { clsx } from "@/lib/clsx";
import {
  LibraryPlate,
  LIBRARY_PLATE_VARIANTS,
  libraryPlateTitle,
  type LibraryPlateVariant,
} from "./LibraryPlate";

type Position = "active" | "left" | "right";

type Props = {
  className?: string;
  compact?: boolean;
};

function positionFor(
  variant: LibraryPlateVariant,
  active: LibraryPlateVariant,
): Position {
  const i = LIBRARY_PLATE_VARIANTS.indexOf(variant);
  const a = LIBRARY_PLATE_VARIANTS.indexOf(active);
  if (i === a) return "active";
  const diff =
    (i - a + LIBRARY_PLATE_VARIANTS.length) % LIBRARY_PLATE_VARIANTS.length;
  return diff === 1 ? "right" : "left";
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function LibraryPlateStack({ className, compact = false }: Props) {
  const [active, setActive] = useState<LibraryPlateVariant>("stills");
  const reducedMotion = useReducedMotion();

  const stageRef = useRef<HTMLDivElement>(null);
  const wrapRefs = useRef<Record<LibraryPlateVariant, HTMLDivElement | null>>({
    stills: null,
    loops: null,
    transparent: null,
  });
  const tiltRefs = useRef<Record<LibraryPlateVariant, HTMLDivElement | null>>({
    stills: null,
    loops: null,
    transparent: null,
  });
  const progressRef = useRef(0);
  const activeRef = useRef<LibraryPlateVariant>(active);

  const peekX = compact ? 18 : 30;
  const peekY = compact ? 8 : 12;
  const peekRot = compact ? 3 : 4;
  const peekScale = compact ? 0.93 : 0.94;
  const introY = compact ? 36 : 56;

  const computeTarget = useCallback(
    (pos: Position, progress: number) => {
      const rest =
        pos === "active"
          ? { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, zIndex: 30 }
          : pos === "left"
            ? {
                x: -peekX,
                y: -peekY,
                rotation: -peekRot,
                scale: peekScale,
                opacity: 0.6,
                zIndex: 10,
              }
            : {
                x: peekX,
                y: -peekY,
                rotation: peekRot,
                scale: peekScale,
                opacity: 0.6,
                zIndex: 20,
              };
      const introScale = pos === "active" ? 1 : 0.9;
      const intro = {
        x: 0,
        y: introY,
        rotation: 0,
        scale: introScale,
        opacity: 0,
        zIndex: rest.zIndex,
      };
      return {
        x: lerp(intro.x, rest.x, progress),
        y: lerp(intro.y, rest.y, progress),
        rotation: lerp(intro.rotation, rest.rotation, progress),
        scale: lerp(intro.scale, rest.scale, progress),
        opacity: lerp(intro.opacity, rest.opacity, progress),
        zIndex: rest.zIndex,
      };
    },
    [peekX, peekY, peekRot, peekScale, introY],
  );

  const applyLayout = useCallback(
    (animated: boolean) => {
      const progress = progressRef.current;
      LIBRARY_PLATE_VARIANTS.forEach((v) => {
        const wrapEl = wrapRefs.current[v];
        if (!wrapEl) return;
        const pos = positionFor(v, activeRef.current);
        const target = computeTarget(pos, progress);
        if (animated) {
          gsap.to(wrapEl, {
            ...target,
            duration: 0.55,
            ease: "power3.out",
            overwrite: "auto",
          });
        } else {
          gsap.set(wrapEl, target);
        }
      });
    },
    [computeTarget],
  );

  // Scroll-scrubbed entrance: progress 0 → 1 as the stack scrolls into view,
  // 1 → 0 as it scrolls back out.
  useEffect(() => {
    // Disable the scroll-scrubbed entrance on phones (<768px) only — it reads as
    // jank on a small viewport. Tablet (768–1023) + desktop keep it. matchMedia
    // is read once per effect run, mirroring useMacbookScrub's idiom; a live
    // 768px crossing is an accepted edge case. Must force the resting pose (not
    // bare `return`) or `computeTarget` strands the plates at opacity 0.
    const isPhone =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches;

    if (reducedMotion || isPhone) {
      progressRef.current = 1;
      applyLayout(false);
      return;
    }
    const stage = stageRef.current;
    if (!stage) return;
    applyLayout(false);
    return deferGsap(() => {
      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: "top 90%",
        end: "top 55%",
        scrub: 0.5,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          applyLayout(false);
        },
      });
      progressRef.current = trigger.progress;
      applyLayout(false);
    });
  }, [reducedMotion, applyLayout]);

  // Shuffle between fanned positions when `active` changes. Smooth-animate only
  // when the stack is at rest; otherwise the scroll handler keeps it in sync.
  useLayoutEffect(() => {
    activeRef.current = active;
    const atRest = progressRef.current > 0.95;
    applyLayout(atRest);
  }, [active, applyLayout]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      if (progressRef.current < 0.9) return;
      const tiltEl = tiltRefs.current[activeRef.current];
      if (!tiltEl) return;
      const rect = tiltEl.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(tiltEl, {
        rotationY: x * 14,
        rotationX: -y * 8,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
    },
    [reducedMotion],
  );

  const handleMouseLeave = useCallback(() => {
    if (reducedMotion) return;
    const tiltEl = tiltRefs.current[activeRef.current];
    if (!tiltEl) return;
    gsap.to(tiltEl, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto",
    });
  }, [reducedMotion]);

  const select = useCallback((variant: LibraryPlateVariant) => {
    setActive(variant);
  }, []);

  return (
    <div className={clsx("flex flex-col gap-8", className)}>
      <div
        role="group"
        aria-label="Library card variant"
        className="flex items-center gap-1.5"
      >
        {LIBRARY_PLATE_VARIANTS.map((v) => {
          const isActive = v === active;
          return (
            <button
              key={v}
              type="button"
              onClick={() => select(v)}
              aria-pressed={isActive}
              className={clsx(
                "rounded-full border px-4 py-[13px] lg:py-2 font-display text-[11.5px] font-semibold uppercase tracking-[0.22em] backdrop-blur-md transition-colors duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#010100]",
                isActive
                  ? "border-white/70 bg-white/[0.18] text-white shadow-[0_4px_18px_rgba(0,0,0,0.45)]"
                  : "border-white/30 bg-white/[0.04] text-white/80 hover:border-white/55 hover:text-white",
              )}
            >
              {libraryPlateTitle(v)}
            </button>
          );
        })}
      </div>

      <div
        ref={stageRef}
        className="relative grid w-full"
        style={{ perspective: "1500px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {LIBRARY_PLATE_VARIANTS.map((v) => {
          const isActive = v === active;
          return (
            <div
              key={v}
              ref={(el) => {
                wrapRefs.current[v] = el;
              }}
              style={{
                gridArea: "1 / 1",
                transformStyle: "preserve-3d",
                willChange: "transform, opacity",
              }}
              aria-hidden={!isActive}
              onClick={isActive ? undefined : () => select(v)}
              className={clsx(
                "outline-none",
                !isActive && "cursor-pointer",
              )}
            >
              <div
                ref={(el) => {
                  tiltRefs.current[v] = el;
                }}
                style={{
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
              >
                <LibraryPlate variant={v} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
