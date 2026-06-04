"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * True when `ref`'s element is actually rendered (not inside a display:none
 * subtree). Re-checks on viewport resize, since the site toggles desktop/mobile
 * variants at the `lg` breakpoint via `hidden lg:block` / `block lg:hidden` —
 * the off-screen variant must not hold a WebGL context. `offsetParent === null`
 * reliably means a display:none ancestor for these (non-fixed) containers.
 */
export function useIsRendered(ref: RefObject<HTMLElement | null>): boolean {
  const [rendered, setRendered] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        setRendered(!!el && el.offsetParent !== null);
      });
    };
    check();
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", check);
    };
  }, [ref]);
  return rendered;
}
