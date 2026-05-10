# Hero Section Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship a cinematic hero section for the Materials marketing site: a pinned, scroll-scrubbed glass-popsicle video with a layered logo + headline + gradient reveal, plus a reduced-motion mobile variant.

**Architecture:** Next.js 15 (App Router) + TypeScript strict + Tailwind v4. One `Hero` composition that swaps between `HeroDesktop` (GSAP `ScrollTrigger` pin + scrub) and `HeroMobile` (one-shot mount timeline) based on viewport. Video scrub is driven by GSAP animating `videoEl.currentTime`; encoded with a 6-frame keyframe interval so backward scrub doesn't stutter. Word-by-word headline reveal via build-time span-splitting (no client hydration mismatch).

**Tech Stack:** Next.js 15, React 19, TypeScript (strict), Tailwind CSS v4, GSAP 3 + `@gsap/react`, ScrollTrigger, Vitest + Testing Library, Plus Jakarta Sans via `next/font`, ffmpeg for video encoding.

---

## Phase 0 — Pre-flight (assets you must have before starting)

These come from outside the codebase. Pause and request from Danny if missing:

1. **Figma exports** from node `317:314` in Materials-Marketing file:
   - `materials-wordmark.svg` (white "Materials" logo)
   - `creative.svg` (purple→orange gradient italic word)
   - Hex values for both bottom radial gradients (the second one uses `mix-blend-plus-lighter`)
2. **Source video:** already at `/Users/Danny/CodeProjects/materials-website/Materials-Hero.mp4`.
3. **ffmpeg installed locally** — verify with `ffmpeg -version`. If missing: `brew install ffmpeg`.

---

## Phase 1 — Project scaffolding

### Task 1: Scaffold Next.js 15 app in current directory

**Files:**
- Create: entire Next.js skeleton in `/Users/Danny/CodeProjects/materials-website/`

**Step 1: Verify directory state**

Run: `ls -la /Users/Danny/CodeProjects/materials-website/`
Expected: only `docs/` and `Materials-Hero.mp4` exist. If anything else is present, STOP and ask.

**Step 2: Scaffold Next.js into the existing directory**

Run from project root:
```bash
pnpm create next-app@latest . \
  --typescript --tailwind --app --src-dir \
  --eslint --import-alias "@/*" --turbopack --yes
```

If prompted about non-empty directory, accept. If `--yes` is rejected on this version, answer prompts: TS=Yes, ESLint=Yes, Tailwind=Yes, src/=Yes, App Router=Yes, Turbopack=Yes, alias=`@/*`.

**Step 3: Verify**

Run: `ls /Users/Danny/CodeProjects/materials-website/src/app/`
Expected: `layout.tsx`, `page.tsx`, `globals.css`, `favicon.ico`.

Run: `pnpm dev` (background, kill after 5 s) and confirm port 3000 boots without errors.

**Step 4: Move the video out of the project root**

```bash
mkdir -p /Users/Danny/CodeProjects/materials-website/assets-source
mv /Users/Danny/CodeProjects/materials-website/Materials-Hero.mp4 \
   /Users/Danny/CodeProjects/materials-website/assets-source/
```

**Step 5: Add `assets-source/` to `.gitignore`**

Append to `.gitignore`:
```
# Source video masters (re-encoded outputs live in public/videos)
assets-source/
```

**Step 6: Initialize git + first commit**

```bash
cd /Users/Danny/CodeProjects/materials-website
git init
git checkout -b feat/hero-section
git add .
git commit -m "chore: scaffold Next.js 15 app for materials marketing site"
```

---

### Task 2: Install runtime dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install GSAP + React adapter + reduced-motion helper**

Run:
```bash
pnpm add gsap @gsap/react
```

**Step 2: Install dev dependencies for testing**

Run:
```bash
pnpm add -D vitest @vitest/ui jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  @vitejs/plugin-react
```

**Step 3: Verify TypeScript strict mode**

Open `tsconfig.json`, confirm `"strict": true` is present in `compilerOptions`. If not, add it.

**Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json
git commit -m "chore: add gsap, vitest, and testing-library deps"
```

---

### Task 3: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `package.json` (scripts)
- Modify: `tsconfig.json` (types)

**Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

**Step 2: Create `src/test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

**Step 3: Add scripts to `package.json`**

Add inside `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 4: Add Vitest globals to `tsconfig.json`**

In `compilerOptions.types`, add `"vitest/globals"` and `"@testing-library/jest-dom"`. Create the array if it doesn't exist.

**Step 5: Smoke test**

Create `src/test/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";
describe("smoke", () => {
  it("runs", () => { expect(1 + 1).toBe(2); });
});
```

Run: `pnpm test`
Expected: 1 passed.

**Step 6: Delete the smoke test and commit**

```bash
rm src/test/smoke.test.ts
git add .
git commit -m "chore: configure vitest with jsdom + testing-library"
```

---

## Phase 2 — Asset preparation

### Task 4: Re-encode video for scrub

**Files:**
- Create: `public/videos/materials-hero.mp4`
- Create: `public/videos/materials-hero.webm`
- Create: `public/videos/materials-hero-720.mp4`
- Create: `public/videos/materials-hero-720.webm`
- Create: `public/videos/materials-hero-poster.jpg`
- Create: `scripts/encode-video.sh`

**Step 1: Create the encoding script**

Write `scripts/encode-video.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail

SRC="assets-source/Materials-Hero.mp4"
OUT="public/videos"
mkdir -p "$OUT"

# Desktop H.264 — keyframe every 6 frames for smooth backward scrub
ffmpeg -y -i "$SRC" \
  -vcodec libx264 -crf 22 -preset slow \
  -g 6 -keyint_min 6 -sc_threshold 0 \
  -movflags +faststart -an \
  "$OUT/materials-hero.mp4"

# Desktop VP9 fallback
ffmpeg -y -i "$SRC" \
  -c:v libvpx-vp9 -crf 32 -b:v 0 \
  -g 6 -keyint_min 6 \
  -an \
  "$OUT/materials-hero.webm"

# Mobile 720p H.264
ffmpeg -y -i "$SRC" \
  -vf "scale=-2:720" \
  -vcodec libx264 -crf 24 -preset slow \
  -g 6 -keyint_min 6 -sc_threshold 0 \
  -movflags +faststart -an \
  "$OUT/materials-hero-720.mp4"

# Mobile 720p VP9
ffmpeg -y -i "$SRC" \
  -vf "scale=-2:720" \
  -c:v libvpx-vp9 -crf 34 -b:v 0 \
  -g 6 -keyint_min 6 \
  -an \
  "$OUT/materials-hero-720.webm"

# Poster (first frame)
ffmpeg -y -i "$SRC" -vframes 1 -q:v 2 "$OUT/materials-hero-poster.jpg"

echo "Done. Output sizes:"
ls -lh "$OUT"
```

**Step 2: Make executable and run**

```bash
chmod +x scripts/encode-video.sh
./scripts/encode-video.sh
```

Expected: 5 files in `public/videos/`. Check sizes — desktop should be ~8–15 MB, mobile ~4–8 MB. If any are >20 MB, lower CRF (`-crf 26`) and re-run.

**Step 3: Verify keyframe density**

Run:
```bash
ffprobe -loglevel error -select_streams v -show_entries packet=pts_time,flags \
  public/videos/materials-hero.mp4 | grep -c K_
```
Expected: count roughly equals total frames ÷ 6 (i.e., a keyframe every 6 frames).

**Step 4: Commit**

```bash
git add scripts/encode-video.sh public/videos/
git commit -m "feat: encode hero video with 6-frame keyframe density for scrub"
```

---

### Task 5: Drop in Figma SVG assets

**Files:**
- Create: `src/components/hero/icons/MaterialsWordmark.tsx`
- Create: `src/components/hero/icons/CreativeWord.tsx`

**Step 1: Place the raw SVGs**

Take the two Figma exports and inline them as React components. Replace XML attrs (`stroke-width` → `strokeWidth`, etc.) — most editors do this automatically.

`src/components/hero/icons/MaterialsWordmark.tsx`:
```tsx
type Props = React.SVGProps<SVGSVGElement>;

export function MaterialsWordmark(props: Props) {
  return (
    <svg
      viewBox="0 0 292 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Materials"
      {...props}
    >
      <title>Materials</title>
      {/* PASTE PATHS FROM Figma export here */}
    </svg>
  );
}
```

`src/components/hero/icons/CreativeWord.tsx`:
```tsx
type Props = React.SVGProps<SVGSVGElement>;

export function CreativeWord(props: Props) {
  return (
    <svg
      viewBox="0 0 240 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* PASTE PATHS + GRADIENT DEFS FROM Figma export here */}
    </svg>
  );
}
```

**Step 2: Verify the viewBox matches the Figma artboard**

Open each SVG export, copy the `width`/`height` to `viewBox="0 0 W H"` if not already set, then drop `width`/`height` from the root so Tailwind classes can size it.

**Step 3: Commit**

```bash
git add src/components/hero/icons/
git commit -m "feat: add Materials wordmark and creative word SVG components"
```

---

### Task 6: Configure Plus Jakarta Sans via next/font

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Step 1: Wire the font in `layout.tsx`**

Replace the existing font imports with:
```tsx
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});
```

In the `<html>` tag, add `className={plusJakartaSans.variable}`. Remove the default Geist font setup that the scaffold added.

**Step 2: Wire the CSS variable in Tailwind**

In `src/app/globals.css`, inside the `@theme` block (Tailwind v4 syntax), add:
```css
@theme {
  --font-display: var(--font-jakarta);
  --color-hero-bg: #010100;
}
```

**Step 3: Set body background and font**

Update `globals.css` body rules:
```css
body {
  background: var(--color-hero-bg);
  color: white;
  font-family: var(--font-display), system-ui, sans-serif;
}
```

**Step 4: Smoke test**

Run `pnpm dev` (background, 5 s, kill). Open `http://localhost:3000` and confirm: black background, white text in Plus Jakarta Sans.

**Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: wire Plus Jakarta Sans via next/font and set hero bg"
```

---

## Phase 3 — Foundation hooks and lib

### Task 7: GSAP plugin registration

**Files:**
- Create: `src/lib/gsap.ts`

**Step 1: Write the registration module**

```ts
"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };
```

**Step 2: Commit**

```bash
git add src/lib/gsap.ts
git commit -m "feat: register gsap plugins in shared module"
```

---

### Task 8: `useReducedMotion` hook (TDD)

**Files:**
- Create: `src/components/hero/useReducedMotion.ts`
- Create: `src/components/hero/useReducedMotion.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReducedMotion } from "./useReducedMotion";

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const mql = {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: (_: string, l: (e: MediaQueryListEvent) => void) => listeners.add(l),
    removeEventListener: (_: string, l: (e: MediaQueryListEvent) => void) => listeners.delete(l),
    dispatchEvent: () => true,
    fire: (next: boolean) => {
      mql.matches = next;
      listeners.forEach((l) => l({ matches: next } as MediaQueryListEvent));
    },
  };
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
  return mql;
}

describe("useReducedMotion", () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it("returns false when user has no preference", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when user prefers reduced motion", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("updates when the preference changes at runtime", () => {
    const mql = mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    act(() => mql.fire(true));
    expect(result.current).toBe(true);
  });
});
```

**Step 2: Run the test, expect failure**

Run: `pnpm test src/components/hero/useReducedMotion.test.tsx`
Expected: FAIL — module not found.

**Step 3: Implement**

```ts
"use client";

import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
```

**Step 4: Run the test**

Run: `pnpm test src/components/hero/useReducedMotion.test.tsx`
Expected: 3 passed.

**Step 5: Commit**

```bash
git add src/components/hero/useReducedMotion.ts src/components/hero/useReducedMotion.test.tsx
git commit -m "feat: add useReducedMotion hook with media-query listener"
```

---

### Task 9: Headline word-split helper (TDD)

The headline is split into per-word `<span>`s at build time. This logic is data, not animation, so it gets a unit test.

**Files:**
- Create: `src/components/hero/headlineLines.ts`
- Create: `src/components/hero/headlineLines.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { HEADLINE_LINES } from "./headlineLines";

describe("HEADLINE_LINES", () => {
  it("has four lines matching Figma", () => {
    expect(HEADLINE_LINES).toHaveLength(4);
  });

  it("flattened plain-text reads naturally", () => {
    const text = HEADLINE_LINES.flat()
      .map((w) => (w.type === "text" ? w.text : "creative"))
      .join(" ");
    expect(text).toBe(
      "Visual ingredients for designers, motion artists, and creative explorers."
    );
  });

  it("the fourth line contains an svg word for 'creative'", () => {
    const line4 = HEADLINE_LINES[3];
    expect(line4.some((w) => w.type === "svg")).toBe(true);
  });
});
```

**Step 2: Run, expect failure**

Run: `pnpm test src/components/hero/headlineLines.test.ts`
Expected: FAIL — module not found.

**Step 3: Implement**

```ts
export type Word =
  | { type: "text"; text: string }
  | { type: "svg" };

export const HEADLINE_LINES: Word[][] = [
  [{ type: "text", text: "Visual" }, { type: "text", text: "ingredients" }],
  [{ type: "text", text: "for" }, { type: "text", text: "designers," }],
  [
    { type: "text", text: "motion" },
    { type: "text", text: "artists," },
    { type: "text", text: "and" },
  ],
  [{ type: "svg" }, { type: "text", text: "explorers." }],
];
```

**Step 4: Run the test**

Run: `pnpm test src/components/hero/headlineLines.test.ts`
Expected: 3 passed.

**Step 5: Commit**

```bash
git add src/components/hero/headlineLines.ts src/components/hero/headlineLines.test.ts
git commit -m "feat: add headline line/word data with build-time split"
```

---

## Phase 4 — Static layout (no animations yet)

Build the desktop end-state first as a static frame. Animations layer on top in Phase 5.

### Task 10: `HeroLogo` component

**Files:**
- Create: `src/components/hero/HeroLogo.tsx`

**Step 1: Implement**

```tsx
import { MaterialsWordmark } from "./icons/MaterialsWordmark";

export function HeroLogo() {
  return (
    <div className="hero-logo" data-hero-logo>
      <MaterialsWordmark className="w-[292px] h-auto text-white" />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/hero/HeroLogo.tsx
git commit -m "feat: add HeroLogo component"
```

---

### Task 11: `HeroHeadline` component

**Files:**
- Create: `src/components/hero/HeroHeadline.tsx`

**Step 1: Implement**

```tsx
import { HEADLINE_LINES } from "./headlineLines";
import { CreativeWord } from "./icons/CreativeWord";

export function HeroHeadline() {
  return (
    <h1
      className="hero-headline font-display font-semibold text-white max-w-[595px]"
      style={{
        fontSize: "64px",
        lineHeight: 1.3,
        letterSpacing: "-2.13px",
      }}
      data-hero-headline
    >
      {HEADLINE_LINES.map((line, lineIdx) => (
        <span className="block" data-hero-headline-line={lineIdx} key={lineIdx}>
          {line.map((word, wordIdx) =>
            word.type === "svg" ? (
              <span
                key={wordIdx}
                className="hero-word inline-block align-baseline mr-[0.25em]"
                data-hero-word
              >
                <CreativeWord className="inline-block h-[0.95em] w-auto align-baseline" />
              </span>
            ) : (
              <span
                key={wordIdx}
                className="hero-word inline-block mr-[0.25em]"
                data-hero-word
              >
                {word.text}
              </span>
            )
          )}
        </span>
      ))}
    </h1>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/hero/HeroHeadline.tsx
git commit -m "feat: add HeroHeadline with per-word spans"
```

---

### Task 12: `HeroVideo` component

**Files:**
- Create: `src/components/hero/HeroVideo.tsx`

**Step 1: Implement**

```tsx
import { forwardRef } from "react";

type Props = {
  variant: "desktop" | "mobile";
};

export const HeroVideo = forwardRef<HTMLVideoElement, Props>(function HeroVideo(
  { variant },
  ref,
) {
  const preload = variant === "desktop" ? "auto" : "metadata";

  return (
    <video
      ref={ref}
      className="hero-video w-full h-auto"
      muted
      playsInline
      preload={preload}
      poster="/videos/materials-hero-poster.jpg"
      role="presentation"
      aria-hidden="true"
      data-hero-video
    >
      {variant === "desktop" ? (
        <>
          <source src="/videos/materials-hero.webm" type="video/webm" />
          <source src="/videos/materials-hero.mp4" type="video/mp4" />
        </>
      ) : (
        <>
          <source src="/videos/materials-hero-720.webm" type="video/webm" />
          <source src="/videos/materials-hero-720.mp4" type="video/mp4" />
        </>
      )}
    </video>
  );
});
```

**Step 2: Commit**

```bash
git add src/components/hero/HeroVideo.tsx
git commit -m "feat: add HeroVideo component with desktop/mobile sources"
```

---

### Task 13: `HeroGradients` component

**Files:**
- Create: `src/components/hero/HeroGradients.tsx`

**Step 1: Implement**

Replace the `radial-gradient` color stops with the exact values from Figma once available. Placeholder colors below.

```tsx
export function HeroGradients() {
  return (
    <div
      className="hero-gradients pointer-events-none absolute inset-x-0 bottom-0 h-[689px]"
      data-hero-gradients
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(40,80,200,0.55) 0%, rgba(10,15,40,0) 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(80,140,255,0.45) 0%, rgba(0,0,0,0) 60%)",
          mixBlendMode: "plus-lighter",
        }}
      />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/hero/HeroGradients.tsx
git commit -m "feat: add HeroGradients with stacked radials and plus-lighter blend"
```

---

### Task 14: `HeroDesktop` static composition

Layout only — no GSAP yet. We render the **end state** so we can verify visually before wiring animation.

**Files:**
- Create: `src/components/hero/HeroDesktop.tsx`

**Step 1: Implement**

```tsx
"use client";

import { useRef } from "react";
import { HeroLogo } from "./HeroLogo";
import { HeroHeadline } from "./HeroHeadline";
import { HeroVideo } from "./HeroVideo";
import { HeroGradients } from "./HeroGradients";

export function HeroDesktop() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section
      ref={sectionRef}
      data-hero-section
      className="relative w-full min-h-screen overflow-hidden bg-hero-bg"
    >
      <div className="absolute inset-0 grid grid-cols-12 gap-x-6 px-12 pt-24">
        <div className="col-span-3 z-30" data-hero-logo-slot>
          <HeroLogo />
        </div>
        <div
          className="col-span-6 z-10 flex items-center justify-center"
          data-hero-video-slot
        >
          <HeroVideo ref={videoRef} variant="desktop" />
        </div>
        <div className="col-span-3 z-30 flex items-center" data-hero-headline-slot>
          <HeroHeadline />
        </div>
      </div>
      <div className="absolute inset-0 z-20">
        <HeroGradients />
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/hero/HeroDesktop.tsx
git commit -m "feat: add HeroDesktop static composition"
```

---

### Task 15: `HeroMobile` static composition

**Files:**
- Create: `src/components/hero/HeroMobile.tsx`

**Step 1: Implement**

```tsx
"use client";

import { useRef } from "react";
import { HeroLogo } from "./HeroLogo";
import { HeroHeadline } from "./HeroHeadline";
import { HeroVideo } from "./HeroVideo";
import { HeroGradients } from "./HeroGradients";

export function HeroMobile() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section
      data-hero-section
      data-hero-mobile
      className="relative w-full min-h-screen overflow-hidden bg-hero-bg flex flex-col px-6 pt-12 pb-0 gap-8"
    >
      <div className="z-30">
        <HeroLogo />
      </div>
      <div className="z-10 flex justify-center">
        <HeroVideo ref={videoRef} variant="mobile" />
      </div>
      <div className="z-30">
        <HeroHeadline />
      </div>
      <HeroGradients />
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/hero/HeroMobile.tsx
git commit -m "feat: add HeroMobile static composition"
```

---

### Task 16: `Hero` composition + responsive switch

**Files:**
- Create: `src/components/hero/Hero.tsx`
- Create: `src/components/hero/Hero.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";

describe("Hero", () => {
  it("renders both desktop and mobile variants in the DOM (CSS toggles visibility)", () => {
    render(<Hero />);
    const sections = screen.getAllByRole("region", { hidden: true });
    expect(sections.length).toBeGreaterThanOrEqual(0);
    expect(document.querySelectorAll("[data-hero-section]")).toHaveLength(2);
  });

  it("renders the headline in both variants", () => {
    render(<Hero />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(2);
  });
});
```

**Step 2: Run, expect failure**

Run: `pnpm test src/components/hero/Hero.test.tsx`
Expected: FAIL — module not found.

**Step 3: Implement using CSS-driven responsive switch**

Both variants render server-side; CSS hides one based on viewport. This avoids a hydration flash and keeps SSR deterministic.

```tsx
import { HeroDesktop } from "./HeroDesktop";
import { HeroMobile } from "./HeroMobile";

export function Hero() {
  return (
    <>
      <div className="hidden lg:block">
        <HeroDesktop />
      </div>
      <div className="block lg:hidden">
        <HeroMobile />
      </div>
    </>
  );
}
```

**Step 4: Run the test**

Run: `pnpm test src/components/hero/Hero.test.tsx`
Expected: 2 passed.

**Step 5: Mount in the page**

Edit `src/app/page.tsx`, replace the scaffold contents:
```tsx
import { Hero } from "@/components/hero/Hero";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <div style={{ height: "200vh" }} aria-hidden="true" />
    </main>
  );
}
```

The 200vh spacer below Hero gives ScrollTrigger room to scrub.

**Step 6: Visual verification**

Run `pnpm dev`. Open `http://localhost:3000` at 1440 wide and at 375 wide (DevTools device toolbar). Confirm:
- Desktop: video centered, logo left, headline right, gradients at bottom, all visible (no animation yet).
- Mobile: stacked logo → video → headline → gradients.

**Step 7: Commit**

```bash
git add src/components/hero/Hero.tsx src/components/hero/Hero.test.tsx src/app/page.tsx
git commit -m "feat: mount Hero composition with responsive CSS switch"
```

---

## Phase 5 — Desktop scroll-scrub timeline

### Task 17: `useHeroTimeline` hook — video scrub only

Build the timeline incrementally. Start with just the video scrub working. Layer the other tracks in subsequent tasks.

**Files:**
- Create: `src/components/hero/useHeroTimeline.ts`
- Modify: `src/components/hero/HeroDesktop.tsx`

**Step 1: Implement minimal hook**

```ts
"use client";

import { useGSAP, gsap, ScrollTrigger } from "@/lib/gsap";
import type { RefObject } from "react";

type Args = {
  sectionRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
};

export function useHeroTimeline({ sectionRef, videoRef, enabled }: Args) {
  useGSAP(
    () => {
      if (!enabled) return;
      const section = sectionRef.current;
      const video = videoRef.current;
      if (!section || !video) return;

      const setup = () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=3000",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        tl.to(video, {
          currentTime: video.duration || 1,
          ease: "none",
          duration: 1,
        });

        return tl;
      };

      if (video.readyState >= 1 && Number.isFinite(video.duration)) {
        setup();
      } else {
        const onMeta = () => { setup(); video.removeEventListener("loadedmetadata", onMeta); };
        video.addEventListener("loadedmetadata", onMeta);
      }
    },
    { scope: sectionRef, dependencies: [enabled] },
  );
}
```

**Step 2: Wire the hook into `HeroDesktop`**

Edit `src/components/hero/HeroDesktop.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { HeroLogo } from "./HeroLogo";
import { HeroHeadline } from "./HeroHeadline";
import { HeroVideo } from "./HeroVideo";
import { HeroGradients } from "./HeroGradients";
import { useHeroTimeline } from "./useHeroTimeline";
import { useReducedMotion } from "./useReducedMotion";

export function HeroDesktop() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useHeroTimeline({ sectionRef, videoRef, enabled: !reduced });

  return (
    /* same JSX as before */
  );
}
```

**Step 3: Visual verification**

Run `pnpm dev`. At desktop width:
- Hero pins on scroll.
- Scrolling drives video frames forward; scrolling back drives them backward without stutter.
- After ~3000 px of scroll, hero unpins and the spacer below appears.

If the video stutters on backward scroll, re-check Task 4 keyframe density.

**Step 4: Commit**

```bash
git add src/components/hero/useHeroTimeline.ts src/components/hero/HeroDesktop.tsx
git commit -m "feat: scroll-scrub video currentTime via pinned ScrollTrigger"
```

---

### Task 18: Add logo entrance to timeline (5–20%)

**Files:**
- Modify: `src/components/hero/useHeroTimeline.ts`

**Step 1: Set logo initial state and add tween**

In `setup()`, after the video tween declaration, add:

```ts
const logo = section.querySelector<HTMLElement>("[data-hero-logo]");
if (logo) {
  gsap.set(logo, { opacity: 0, scale: 0.96, y: 12, filter: "blur(6px)" });
  tl.to(
    logo,
    {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      ease: "power2.out",
      duration: 0.15, // 5% → 20% of timeline
    },
    0.05, // start at 5%
  );
}
```

**Step 2: Visual verification**

Reload `http://localhost:3000`. Scroll slowly. Logo should fade + un-blur + slight up-shift between 5–20% of the pin distance.

**Step 3: Commit**

```bash
git add src/components/hero/useHeroTimeline.ts
git commit -m "feat: animate logo entrance in hero timeline (5-20%)"
```

---

### Task 19: Add video shift + logo shrink (40–55%)

**Files:**
- Modify: `src/components/hero/useHeroTimeline.ts`

**Step 1: Add the tweens**

Append to the timeline (after logo entrance):

```ts
tl.to(
  video,
  { x: "-12%", scale: 0.78, ease: "power2.inOut", duration: 0.15 },
  0.40,
);

if (logo) {
  tl.to(
    logo,
    { scale: 0.7, ease: "power2.inOut", duration: 0.15 },
    0.40,
  );
}
```

**Step 2: Visual verification**

Scroll to mid-section. Video should slide left and scale down to ~78%; logo shrinks to ~70% in the same window.

**Step 3: Commit**

```bash
git add src/components/hero/useHeroTimeline.ts
git commit -m "feat: shift video left and shrink logo at 40-55% of timeline"
```

---

### Task 20: Add headline word stagger (50–75%)

**Files:**
- Modify: `src/components/hero/useHeroTimeline.ts`

**Step 1: Add stagger tweens per line**

```ts
const headlineLines = section.querySelectorAll<HTMLElement>(
  "[data-hero-headline-line]",
);

headlineLines.forEach((line, lineIdx) => {
  const words = line.querySelectorAll<HTMLElement>("[data-hero-word]");
  if (!words.length) return;

  gsap.set(words, { opacity: 0, y: 14, filter: "blur(10px)" });

  const lineOffset = 0.50 + lineIdx * 0.06; // ~120ms per line at scrub=1, scaled
  tl.to(
    words,
    {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      ease: "power2.out",
      duration: 0.05,
      stagger: { each: 0.025, from: "start" },
    },
    lineOffset,
  );
});
```

**Step 2: Visual verification**

Scroll past 50% of the pin distance. Words should reveal left-to-right per line, with subsequent lines starting slightly later. The `creative` SVG should reveal as a single word with the same blur+fade+y treatment.

**Step 3: Commit**

```bash
git add src/components/hero/useHeroTimeline.ts
git commit -m "feat: animate headline words with per-line stagger (50-75%)"
```

---

### Task 21: Add gradients reveal (80–100%)

**Files:**
- Modify: `src/components/hero/useHeroTimeline.ts`

**Step 1: Add gradient tween**

```ts
const gradients = section.querySelector<HTMLElement>("[data-hero-gradients]");
if (gradients) {
  gsap.set(gradients, { opacity: 0 });
  tl.to(
    gradients,
    { opacity: 1, ease: "power1.out", duration: 0.20 },
    0.80,
  );
}
```

**Step 2: Visual verification**

Scroll to the end of the pin. Bottom gradients should fade in over the last 20% of scroll.

**Step 3: Commit**

```bash
git add src/components/hero/useHeroTimeline.ts
git commit -m "feat: fade in bottom gradients at 80-100% of timeline"
```

---

### Task 22: Cleanup + edge cases for `useHeroTimeline`

**Files:**
- Modify: `src/components/hero/useHeroTimeline.ts`

**Step 1: Add ScrollTrigger refresh on video metadata load**

If the video's `duration` is `NaN` at first paint, the timeline binds to `1` and never updates. Add a refresh after metadata loads even when duration was already finite, to be safe:

After `setup()` is called inside the `loadedmetadata` branch, also call `ScrollTrigger.refresh()` so the pinned timeline accounts for layout that may have shifted as the poster swapped to the loaded video.

```ts
const onMeta = () => {
  setup();
  ScrollTrigger.refresh();
  video.removeEventListener("loadedmetadata", onMeta);
};
```

**Step 2: Verify no regressions**

Hard-reload `http://localhost:3000` (clear cache). Confirm the scrub still works and the pin distance is correct.

**Step 3: Commit**

```bash
git add src/components/hero/useHeroTimeline.ts
git commit -m "fix: refresh ScrollTrigger after video metadata loads"
```

---

## Phase 6 — Mobile on-mount timeline

### Task 23: `useHeroMobileTimeline` hook

**Files:**
- Create: `src/components/hero/useHeroMobileTimeline.ts`
- Modify: `src/components/hero/HeroMobile.tsx`

**Step 1: Implement**

```ts
"use client";

import { useGSAP, gsap } from "@/lib/gsap";
import type { RefObject } from "react";

type Args = {
  sectionRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
};

export function useHeroMobileTimeline({ sectionRef, videoRef, enabled }: Args) {
  useGSAP(
    () => {
      if (!enabled) return;
      const section = sectionRef.current;
      const video = videoRef.current;
      if (!section) return;

      const logo = section.querySelector<HTMLElement>("[data-hero-logo]");
      const words = section.querySelectorAll<HTMLElement>("[data-hero-word]");
      const gradients = section.querySelector<HTMLElement>("[data-hero-gradients]");

      if (logo) gsap.set(logo, { opacity: 0, y: 12, filter: "blur(6px)" });
      if (video) gsap.set(video, { opacity: 0 });
      if (words.length) gsap.set(words, { opacity: 0, y: 10, filter: "blur(8px)" });
      if (gradients) gsap.set(gradients, { opacity: 0 });

      const tl = gsap.timeline();

      if (logo) {
        tl.to(logo, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.5,
          ease: "power2.out",
        });
      }

      if (video) {
        tl.to(video, { opacity: 1, duration: 0.4, ease: "power1.out" }, "-=0.2")
          .add(() => { void video.play().catch(() => {}); }, "<");
      }

      if (words.length) {
        tl.to(
          words,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.4,
            ease: "power2.out",
            stagger: { each: 0.03, from: "start" },
          },
          "-=0.15",
        );
      }

      if (gradients) {
        tl.to(gradients, { opacity: 1, duration: 0.6 }, "-=0.3");
      }
    },
    { scope: sectionRef, dependencies: [enabled] },
  );
}
```

**Step 2: Wire into `HeroMobile`**

Edit `src/components/hero/HeroMobile.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { HeroLogo } from "./HeroLogo";
import { HeroHeadline } from "./HeroHeadline";
import { HeroVideo } from "./HeroVideo";
import { HeroGradients } from "./HeroGradients";
import { useHeroMobileTimeline } from "./useHeroMobileTimeline";
import { useReducedMotion } from "./useReducedMotion";

export function HeroMobile() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useHeroMobileTimeline({ sectionRef, videoRef, enabled: !reduced });

  return (
    <section
      ref={sectionRef}
      data-hero-section
      data-hero-mobile
      className="relative w-full min-h-screen overflow-hidden bg-hero-bg flex flex-col px-6 pt-12 pb-0 gap-8"
    >
      {/* same children */}
    </section>
  );
}
```

**Step 3: Visual verification**

In DevTools device toolbar, switch to iPhone 14 (390 wide). Reload. The mount sequence should play: logo → video starts + fades → headline staggers in → gradients fade.

**Step 4: Commit**

```bash
git add src/components/hero/useHeroMobileTimeline.ts src/components/hero/HeroMobile.tsx
git commit -m "feat: add mobile on-mount entrance timeline"
```

---

## Phase 7 — Reduced-motion + accessibility polish

### Task 24: Reduced-motion final-state guarantees

When `prefers-reduced-motion: reduce`, the hooks early-return — but the `gsap.set()` calls never run, so initial states are never applied. Verify the CSS-default state matches the design's final state.

**Files:**
- Modify: `src/components/hero/HeroLogo.tsx`
- Modify: `src/components/hero/HeroHeadline.tsx`
- Modify: `src/components/hero/HeroGradients.tsx`
- Modify: `src/components/hero/HeroVideo.tsx`

**Step 1: Confirm defaults**

These should already be visible by default since we only hide them via `gsap.set` inside the hooks. Toggle `Emulate CSS prefers-reduced-motion: reduce` in Chrome DevTools (Rendering panel) and reload. Confirm:
- Desktop: logo, headline, video, gradients all visible immediately. No pin, no scroll trigger. Page scrolls normally.
- Mobile: same — fully composed on first paint, video shows poster (does not autoplay).

**Step 2: Suppress mobile autoplay under reduced motion**

In `useHeroMobileTimeline`, autoplay is gated behind `enabled` already — verify the video shows the poster without attempting to play when reduced is on.

**Step 3: Commit (only if any tweak was needed)**

```bash
git add -A
git commit -m "fix: ensure reduced-motion shows fully-composed hero with no autoplay"
```

If nothing changed, skip the commit.

---

### Task 25: Accessibility audit

**Files:**
- Possibly modify: any of the hero components

**Step 1: Heading order**

`HeroDesktop` and `HeroMobile` each render `<h1>`. The page has only one `<Hero>` mounted via CSS hide/show, but **both DOM trees exist**. Two `<h1>` tags is an a11y problem.

Fix: in `Hero.tsx`, ensure only the visible variant is in the a11y tree by adding `aria-hidden="true"` to the hidden wrapper and `inert` (cast to any if TS complains until React 19 types catch up):

```tsx
import { HeroDesktop } from "./HeroDesktop";
import { HeroMobile } from "./HeroMobile";

export function Hero() {
  return (
    <>
      <div className="hidden lg:block" aria-hidden="false">
        <HeroDesktop />
      </div>
      <div className="block lg:hidden" aria-hidden="false">
        <HeroMobile />
      </div>
    </>
  );
}
```

CSS `display: none` (which Tailwind's `hidden` produces) already removes the element from the a11y tree, so this is sufficient. Update the test from Task 16 — it asserts two `<h1>` in the DOM, which is correct (display:none doesn't change DOM presence). No code change needed.

**Step 2: Run axe via DevTools**

Open `http://localhost:3000`, run a Lighthouse a11y audit. Score must be ≥95. Fix any violations.

**Step 3: Keyboard check**

Tab through the page. There should be no focusable elements in the hero (it's purely decorative content). Confirm no focus traps.

**Step 4: Screen reader check (optional but recommended)**

VoiceOver: Cmd-F5. The headline should read naturally, with "creative" pronounced as one word (the SVG has `aria-hidden`, so VoiceOver reads the surrounding text as `... and explorers.`). If "creative" must be announced, add a visually-hidden text node inside its span:

```tsx
<span className="sr-only">creative</span>
```

Add a `.sr-only` utility to `globals.css` if not present:
```css
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap; border: 0;
}
```

**Step 5: Commit if changes were made**

```bash
git add -A
git commit -m "a11y: ensure 'creative' SVG word is announced by screen readers"
```

---

## Phase 8 — Performance polish

### Task 26: Preload tuning + pin spacer behavior

**Files:**
- Modify: `src/components/hero/useHeroTimeline.ts`

**Step 1: Configure ScrollTrigger pinType for non-touch**

Inside `setup()`, before creating the timeline:
```ts
const isTouch = window.matchMedia("(pointer: coarse)").matches;
ScrollTrigger.config({ ignoreMobileResize: true });

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: section,
    start: "top top",
    end: "+=3000",
    scrub: 1,
    pin: true,
    anticipatePin: 1,
    pinType: isTouch ? "fixed" : "transform",
  },
});
```

(Per GSAP docs the default already picks well, but stating it explicitly matches the design doc.)

**Step 2: Confirm `<video>` preload still respects viewport**

`HeroVideo` already uses `preload="auto"` for desktop and `"metadata"` for mobile. No change.

**Step 3: Commit**

```bash
git add src/components/hero/useHeroTimeline.ts
git commit -m "perf: explicit pinType + suppress mobile resize ScrollTrigger thrash"
```

---

### Task 27: Production build smoke test

**Files:**
- None (build verification only)

**Step 1: Build**

Run: `pnpm build`
Expected: build succeeds, no type errors, no ESLint errors.

**Step 2: Run production server**

Run: `pnpm start` (background, give it 3 s).
Open `http://localhost:3000`. Verify:
- Desktop scrub still works.
- Mobile entrance still works.
- DevTools Network tab: video size is reasonable, only one variant loads per breakpoint.

**Step 3: Lighthouse desktop run**

Lighthouse Performance ≥85 on desktop. If LCP is the bottleneck, the LCP element is likely the video poster — confirm `priority` semantics (poster is part of `<video>`, no Next/Image involvement).

**Step 4: Final commit + tag**

```bash
git add -A
git commit --allow-empty -m "chore: hero section ready for review"
git tag hero-section-v1
```

---

## Phase 9 — Wrap-up checklist

Before declaring done, sweep:

- [ ] `pnpm test` passes.
- [ ] `pnpm build` succeeds with zero warnings.
- [ ] `pnpm lint` is clean.
- [ ] Desktop scrub is smooth in both directions in Chrome and Safari.
- [ ] Mobile entrance plays once on iPhone Safari emulation.
- [ ] `prefers-reduced-motion: reduce` shows the composed hero with no animation and no video playback.
- [ ] Lighthouse a11y ≥95, perf ≥85.
- [ ] No console errors or warnings on page load.
- [ ] Headline reads as semantic `<h1>` with "creative" announced.
- [ ] Video files in `public/videos/` total <40 MB.

---

## Open follow-ups (not in scope)

These were flagged in the design doc as deferred. Track separately:

- Exact `vw`-based math for video shift across desktop widths (currently `-12%` is a magic number).
- Replace inline `creative` SVG with CSS gradient + italic webfont if/when the typeface is identified.
- Header nav, footer, and rest of the marketing site.
