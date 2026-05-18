"use client";

import { useEffect, useRef, useState } from "react";
import { RECIPE_MATERIALS } from "./materials";

const PHRASE = "dripping ice lolly";
const TYPE_INTERVAL_MS = 70;
const TYPE_HOLD_MS = 600;
const CYCLE_MS = 2400;
// Short kick-off so the carousel announces itself the moment the section
// enters view, instead of sitting idle through the typing pass.
const FIRST_CYCLE_DELAY_MS = 700;

type Options = {
  start: boolean;
  reducedMotion: boolean;
};

export function useRecipeDemo({ start, reducedMotion }: Options) {
  const [typed, setTyped] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const cycleRef = useRef<number | null>(null);
  const firstCycleRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    if (!start) return;

    let cancelled = false;

    let i = 0;
    const tick = () => {
      if (cancelled) return;
      i += 1;
      setTyped(PHRASE.slice(0, i));
      if (i < PHRASE.length) {
        window.setTimeout(tick, TYPE_INTERVAL_MS);
      } else {
        window.setTimeout(() => {
          if (cancelled) return;
          setTypingDone(true);
        }, TYPE_HOLD_MS);
      }
    };
    const startTimer = window.setTimeout(tick, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
    };
  }, [start, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    if (!start) return;

    const advance = () =>
      setActiveIndex((idx) => (idx + 1) % RECIPE_MATERIALS.length);

    firstCycleRef.current = window.setTimeout(() => {
      advance();
      cycleRef.current = window.setInterval(advance, CYCLE_MS);
    }, FIRST_CYCLE_DELAY_MS);

    return () => {
      if (firstCycleRef.current != null) {
        window.clearTimeout(firstCycleRef.current);
        firstCycleRef.current = null;
      }
      if (cycleRef.current != null) {
        window.clearInterval(cycleRef.current);
        cycleRef.current = null;
      }
    };
  }, [start, reducedMotion]);

  if (reducedMotion) {
    return {
      phrase: PHRASE,
      typed: PHRASE,
      typingDone: true,
      activeIndex: 0,
      materials: RECIPE_MATERIALS,
    };
  }

  return {
    phrase: PHRASE,
    typed,
    typingDone,
    activeIndex,
    materials: RECIPE_MATERIALS,
  };
}
