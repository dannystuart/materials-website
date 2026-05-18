"use client";

import { gsap } from "@/lib/gsap";

// Defers gsap/ScrollTrigger creation by one animation frame so React 19
// Strict Mode's double-mount cleanup runs before triggers register.
// Works around a race in gsap 3.15's ScrollTrigger.refresh() ("Cannot read
// properties of undefined (reading 'end')") when sibling components
// concurrently kill/create triggers across the double-mount.
//
// Wrap the deferred creates with gsap.context() so every tween/timeline/
// ScrollTrigger made inside `setup` is tracked together and reverted on
// cleanup.
export function deferGsap(setup: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  let ctx: gsap.Context | null = null;
  const raf = window.requestAnimationFrame(() => {
    ctx = gsap.context(setup);
  });
  return () => {
    window.cancelAnimationFrame(raf);
    ctx?.revert();
    ctx = null;
  };
}
