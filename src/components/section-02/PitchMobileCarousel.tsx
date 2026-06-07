"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PitchHub } from "./PitchHub";
import { PitchDesignOutput, PitchAIOutput } from "./PitchOutputs";
import { PitchMobileOrbits } from "./PitchDiagram";
import { GlowConnector, WARM, COOL, HOT } from "./PitchConnector";
import { centerProximityToOpacity } from "./pitchConnectorGeometry";
import type { PointerTargetRef } from "./useSectionPointer";
import { useReducedMotion } from "@/components/hero/useReducedMotion";

type Props = {
  /** Orbit-parallax pointer ref, forwarded to the WebGL rings. */
  pointer?: PointerTargetRef;
  /** Forwarded to the diagram wrapper so the section's reveal/parallax sees it. */
  diagramRef?: React.RefObject<HTMLDivElement | null>;
};

/** One connector line's live endpoints (wrapper-relative px) + brightness. */
type Line = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
};

/** Pre-measurement placeholder: zero-length (so nothing paints until
 * measure() sets real endpoints) but opacity 1, so the brightness <g> is
 * visible-by-default and never stranded at 0 if measure() is delayed —
 * mirrors the codebase's visible-by-default model and keeps the static
 * reduced-motion draw independent of measurement timing. */
const INITIAL_LINE: Line = { x1: 0, y1: 0, x2: 0, y2: 0, opacity: 1 };

export function PitchMobileCarousel({ pointer, diagramRef }: Props) {
  const reducedMotion = useReducedMotion();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const designCardRef = useRef<HTMLDivElement>(null);
  const aiCardRef = useRef<HTMLDivElement>(null);

  // SVG viewBox is sized 1:1 to the wrapper in CSS px (1 unit = 1px).
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [designLine, setDesignLine] = useState<Line>(INITIAL_LINE);
  const [aiLine, setAiLine] = useState<Line>(INITIAL_LINE);

  /**
   * Recompute both lines from current layout. start = hub bottom-centre;
   * end = each card's top-centre; both made wrapper-relative. Brightness
   * follows how centred each card is within the visible track.
   */
  const measure = useCallback(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    const hub = hubRef.current;
    const designCard = designCardRef.current;
    const aiCard = aiCardRef.current;
    if (!wrapper || !track || !hub || !designCard || !aiCard) return;

    const wrapRect = wrapper.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const hubRect = hub.getBoundingClientRect();

    setSize((prev) =>
      prev.w === wrapRect.width && prev.h === wrapRect.height
        ? prev
        : { w: wrapRect.width, h: wrapRect.height },
    );

    // Hub bottom-centre, relative to the wrapper.
    const startX = hubRect.left + hubRect.width / 2 - wrapRect.left;
    const startY = hubRect.bottom - wrapRect.top;

    // The visible track's horizontal centre (viewport coords).
    const trackCenterX = trackRect.left + trackRect.width / 2;
    const halfWidth = trackRect.width / 2;

    const lineFor = (card: HTMLDivElement): Line => {
      const r = card.getBoundingClientRect();
      const cardCenterX = r.left + r.width / 2;
      return {
        x1: startX,
        y1: startY,
        x2: cardCenterX - wrapRect.left,
        y2: r.top - wrapRect.top,
        opacity: centerProximityToOpacity(
          cardCenterX - trackCenterX,
          halfWidth,
        ),
      };
    };

    setDesignLine(lineFor(designCard));
    setAiLine(lineFor(aiCard));
  }, []);

  // Initial measure + element-size tracking (fonts, image loads, orientation).
  useEffect(() => {
    measure();

    const ro = new ResizeObserver(measure);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    if (trackRef.current) ro.observe(trackRef.current);

    window.addEventListener("resize", measure);
    // Measure again after layout/image settle on first paint.
    const raf = requestAnimationFrame(measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
    };
  }, [measure]);

  // Live scroll tracking — rAF-throttled passive listener. Skipped under
  // reduced motion (lines stay at their resting layout; swiping still works).
  useEffect(() => {
    if (reducedMotion) return;
    const track = trackRef.current;
    if (!track) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        measure();
      });
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [reducedMotion, measure]);

  return (
    <div ref={wrapperRef} className="relative mt-14">
      {/* Rings + hub diagram — unchanged graphic, keeps parallax wiring.
          z-10 so the hub paints above the connector overlay (line start nodes
          tuck behind the hub, as on desktop). */}
      <div
        ref={diagramRef}
        className="relative z-10 mx-auto flex aspect-square w-full max-w-[400px] items-center justify-center"
      >
        <PitchMobileOrbits pointer={pointer} />
        <div ref={hubRef} data-reveal="hub">
          <PitchHub size={260} />
        </div>
      </div>

      {/* Connector overlay — two swipe-tracked glowing lines from hub → cards.
          Placed before the track so the cards stack above the line endpoints
          (the glow tucks under each card's top edge, matching desktop). Each
          GlowConnector carries its own data-reveal="connector" group, so the
          section timeline fades them in on entry (and the global reduced-motion
          rule resets them to opacity 1). The intermediate brightness <g>
          multiplies the live centred-ness opacity over that. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
        width={size.w}
        height={size.h}
        viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
        preserveAspectRatio="none"
      >
        <g style={{ opacity: designLine.opacity }}>
          <GlowConnector
            id="m-conn-design"
            x1={designLine.x1}
            y1={designLine.y1}
            x2={designLine.x2}
            y2={designLine.y2}
            startColor={WARM}
            endColor={HOT}
          />
        </g>
        <g style={{ opacity: aiLine.opacity }}>
          <GlowConnector
            id="m-conn-ai"
            x1={aiLine.x1}
            y1={aiLine.y1}
            x2={aiLine.x2}
            y2={aiLine.y2}
            startColor={HOT}
            endColor={COOL}
          />
        </g>
      </svg>

      {/* Swipe carousel — active card centred, next card peeking. The track is
          relative + z-10 so cards sit above the connector overlay.
          overflow-y-hidden is deliberate: `overflow-x: auto` silently promotes
          `overflow-y` to `auto` (the spec forbids auto-x + visible-y), and the
          cards' invisible group-hover halo (-inset-20 = 80px) adds phantom
          vertical overflow. That let touch-drags scroll the track ~80px in Y,
          clipping cards and jolting the connector lines via the scroll listener.
          Clipping Y keeps the track horizontal-only; vertical drags bubble to
          the page. No visual change at rest (the promoted auto already clipped
          Y at scrollTop 0). */}
      {/* -mx-6 breaks the track out of the section's px-6 gutter so it spans
          the full viewport width — the peeking neighbour cards run to both
          screen edges instead of being clipped 24px short of them. */}
      <div
        ref={trackRef}
        className="no-scrollbar relative z-10 -mx-6 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden scroll-smooth [scroll-padding-inline:11%]"
      >
        <div
          ref={designCardRef}
          data-reveal="card"
          className="w-[78%] min-w-0 shrink-0 snap-center"
        >
          <PitchDesignOutput />
        </div>
        <div
          ref={aiCardRef}
          data-reveal="card"
          className="w-[78%] min-w-0 shrink-0 snap-center"
        >
          <PitchAIOutput />
        </div>
      </div>
    </div>
  );
}
