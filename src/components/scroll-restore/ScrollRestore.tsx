"use client";

import { useEffect } from "react";
import { whenDeferredGsapDrained } from "@/lib/scrollTrigger";

const KEY = "materials-scroll-y";

export function ScrollRestore() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const save = () => {
      try {
        sessionStorage.setItem(KEY, String(window.scrollY));
      } catch {}
    };
    window.addEventListener("pagehide", save);
    window.addEventListener("beforeunload", save);

    let savedY = 0;
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) savedY = Number(raw) || 0;
    } catch {}

    let rafA = 0;
    let rafB = 0;
    let rafC = 0;
    let timerId = 0;
    let safetyId = 0;

    const clearOverlay = () => {
      document.documentElement.classList.remove("scroll-restoring");
    };

    const restore = () => {
      window.scrollTo(0, savedY);
      rafC = requestAnimationFrame(() => {
        window.scrollTo(0, savedY);
        // Hold the visibility overlay until every queued ScrollTrigger
        // setup has fired — otherwise a deep-scroll refresh briefly shows
        // section-3 plates / section-5 macbook in intro state before the
        // scrub catches up.
        whenDeferredGsapDrained().then(clearOverlay);
      });
    };

    const schedule = () => {
      rafA = requestAnimationFrame(() => {
        rafB = requestAnimationFrame(() => {
          timerId = window.setTimeout(restore, 0);
        });
      });
    };

    if (savedY > 0) {
      if (document.readyState === "complete") {
        schedule();
      } else {
        window.addEventListener("load", schedule, { once: true });
      }
      safetyId = window.setTimeout(clearOverlay, 2000);
    } else {
      clearOverlay();
    }

    return () => {
      window.removeEventListener("pagehide", save);
      window.removeEventListener("beforeunload", save);
      window.removeEventListener("load", schedule);
      if (rafA) cancelAnimationFrame(rafA);
      if (rafB) cancelAnimationFrame(rafB);
      if (rafC) cancelAnimationFrame(rafC);
      if (timerId) clearTimeout(timerId);
      if (safetyId) clearTimeout(safetyId);
    };
  }, []);

  return null;
}
