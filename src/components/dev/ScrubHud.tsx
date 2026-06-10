"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";

// Diagnostic-only instrumentation for the §05 scrub (iOS regression hunt).
// Inert unless the page is loaded with `?scrubhud=1`. Renders a fixed HUD
// (outside the sticky subtree) and streams per-frame samples + video events
// to a local sink server so a Simulator/real-device run can be read back.
// See docs/plans/2026-06-10-section05-ios-scrub-keyframes.md.

const SINK = "http://localhost:5055/log";

type StInstance = ReturnType<typeof ScrollTrigger.create>;

export function ScrubHud() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("scrubhud")) return;
    const id = window.setTimeout(() => setOn(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!on) return;
    let raf = 0;
    const buf: Record<string, unknown>[] = [];
    const hud = document.getElementById("scrubhud-readout");

    // Failed batches are re-queued, not dropped — an earlier run lost the
    // entire load+scrub window to early flush failures, which is exactly the
    // evidence the HUD exists to capture. keepalive is reserved for the
    // page-hide beacon: keepalive fetches share a small per-page in-flight
    // quota that early-load flushes can exhaust.
    const requeue = (batch: Record<string, unknown>[]) => {
      buf.unshift(...batch);
      if (buf.length > 50000) buf.length = 50000;
    };
    const flush = () => {
      if (!buf.length) return;
      const batch = buf.splice(0, buf.length);
      try {
        void fetch(SINK, {
          method: "POST",
          body: JSON.stringify(batch),
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
        }).catch(() => requeue(batch));
      } catch {
        requeue(batch);
      }
    };
    const iv = window.setInterval(flush, 500);

    // Resolve targets lazily — the scrub trigger is deferred-created, and the
    // visible variant (desktop vs mobile twin) is whichever has a layout box.
    let travel: HTMLElement | null = null;
    let block: HTMLElement | null = null;
    let video: HTMLVideoElement | null = null;
    let st: StInstance | null = null;
    let evBound = false;

    const resolve = () => {
      if (!travel) {
        const travels = Array.from(
          document.querySelectorAll<HTMLElement>("[data-macbook-travel]"),
        );
        travel =
          travels.find((t) => t.getBoundingClientRect().height > 0) ?? null;
        block = travel?.querySelector<HTMLElement>("[data-macbook-demo]") ?? null;
        video = travel?.querySelector("video") ?? null;
      }
      if (travel && !st) {
        st = ScrollTrigger.getAll().find((s) => s.trigger === travel) ?? null;
        if (st) {
          buf.push({
            k: "found-st",
            t: Math.round(performance.now()),
            start: Math.round(st.start),
            end: Math.round(st.end),
          });
        }
      }
      if (video && !evBound) {
        evBound = true;
        const v = video;
        for (const ev of [
          "loadedmetadata",
          "seeking",
          "seeked",
          "play",
          "playing",
          "pause",
          "waiting",
          "stalled",
          "error",
          "canplay",
        ]) {
          v.addEventListener(ev, () =>
            buf.push({
              k: "ev",
              ev,
              t: Math.round(performance.now()),
              vt: +v.currentTime.toFixed(3),
              rs: v.readyState,
            }),
          );
        }
      }
    };

    // Layout-shift tracer: watch every top-level block's absolute top and log
    // which element moved (WebKit has no `layout-shift` PerformanceObserver).
    const lastTops = new Map<Element, number>();
    const traceShifts = () => {
      const blocks = document.querySelectorAll(
        "main > *, footer, [data-macbook-travel]",
      );
      for (const el of blocks) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue; // display:none twin
        const top = Math.round(window.scrollY + r.top);
        const prev = lastTops.get(el);
        if (prev !== undefined && Math.abs(top - prev) > 2) {
          buf.push({
            k: "shift",
            t: Math.round(performance.now()),
            el:
              el.tagName.toLowerCase() +
              (el.id ? `#${el.id}` : "") +
              "." +
              (el.className?.toString().split(" ")[0] ?? ""),
            from: prev,
            to: top,
          });
        }
        lastTops.set(el, top);
      }
    };

    const tick = () => {
      resolve();
      traceShifts();
      if (travel && block && video) {
        const tr = travel.getBoundingClientRect();
        const s = {
          k: "s",
          t: Math.round(performance.now()),
          y: Math.round(window.scrollY),
          // What ScrollTrigger believes the scroll position is — if this lags
          // `y` during a touch scroll, updates are being starved.
          stScroll: st ? Math.round(st.scroll()) : null,
          // True live geometry vs the trigger's believed zone.
          travelAbs: Math.round(window.scrollY + tr.top),
          demoTop: Math.round(block.getBoundingClientRect().top),
          stStart: st ? Math.round(st.start) : null,
          stEnd: st ? Math.round(st.end) : null,
          act: st ? st.isActive : null,
          prog: st ? +st.progress.toFixed(3) : null,
          vt: +video.currentTime.toFixed(3),
          rs: video.readyState,
          p: video.paused,
          // End of the first buffered range — 0 means no media data fetched
          // (the iOS preload="auto"-ignored case the warm kiss exists for).
          bufEnd: video.buffered.length
            ? +video.buffered.end(video.buffered.length - 1).toFixed(2)
            : 0,
          docH: Math.round(document.documentElement.scrollHeight),
          ih: window.innerHeight,
          vvh: window.visualViewport
            ? Math.round(window.visualViewport.height)
            : null,
        };
        buf.push(s);
        if (hud) {
          hud.textContent =
            `y:${s.y} stScroll:${s.stScroll}\n` +
            `zone:[${s.stStart}→${s.stEnd}] travelAbs:${s.travelAbs} Δ:${
              s.stStart === null ? "?" : s.travelAbs - s.stStart
            }\n` +
            `demoTop:${s.demoTop} ${s.act ? "ACTIVE" : "idle"} prog:${s.prog}\n` +
            `vt:${s.vt} rs:${s.rs} buf:${s.bufEnd} ${s.p ? "paused" : "PLAYING"} ih:${s.ih} vvh:${s.vvh}`;
        }
      } else if (hud) {
        hud.textContent = "scrubhud: waiting for travel/trigger…";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Optional auto-glide (`&scrubauto=1`): once the trigger resolves, glide
    // programmatically from above the zone to past it. This exercises the JS
    // scroll path only — if the zone works here but fails under real touch,
    // the fault is in the touch/compositor path, not the geometry.
    let glideStarted = false;
    const maybeGlide = () => {
      if (glideStarted || !travel || !st) return;
      if (!new URLSearchParams(window.location.search).has("scrubauto")) return;
      glideStarted = true;
      const zoneTop = Math.round(
        window.scrollY + travel.getBoundingClientRect().top,
      );
      const from = Math.max(0, zoneTop - 600);
      const to = zoneTop + (st.end - st.start) + 800;
      buf.push({ k: "glide-start", t: Math.round(performance.now()), from, to });
      let yPos = from;
      const step = () => {
        yPos += 18;
        window.scrollTo(0, Math.min(yPos, to));
        if (yPos < to) {
          requestAnimationFrame(step);
        } else {
          buf.push({ k: "glide-end", t: Math.round(performance.now()) });
        }
      };
      window.scrollTo(0, from);
      setTimeout(() => requestAnimationFrame(step), 800);
    };
    const glideTimer = window.setInterval(() => {
      maybeGlide();
      if (glideStarted) clearInterval(glideTimer);
    }, 500);

    const onHide = () => {
      if (!buf.length) return;
      navigator.sendBeacon?.(
        SINK,
        JSON.stringify(buf.splice(0, buf.length)),
      );
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(iv);
      clearInterval(glideTimer);
      flush();
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [on]);

  if (!on) return null;
  return (
    <div
      id="scrubhud-readout"
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.78)",
        color: "#4ade80",
        font: "11px/1.45 ui-monospace, monospace",
        padding:
          "6px 8px calc(6px + env(safe-area-inset-bottom, 0px))",
        pointerEvents: "none",
        whiteSpace: "pre-wrap",
      }}
    />
  );
}
