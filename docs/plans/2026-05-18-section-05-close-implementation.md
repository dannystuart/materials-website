# §05 Close — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Build the closing section — two side-by-side pack cards (paid Materials¹ $9, free Dark Materials) with twin atmospheric halos, gradient-word headline, and a calm hand-off into the floating CTA region.

**Architecture:** New section at `src/components/section-05/`. Two variant-driven cards share one `PackCard.tsx` component; each gets its own `PackHalo.tsx` WebGL field behind it (a *brand-new* component — §02's `PitchOrbits.tsx` is locked and must not be touched). Desktop-led layout with mobile stack at the same breakpoint convention as §02. Existing `FloatingCta.tsx` is **not modified** in this plan — the inline paid CTA simply coexists with it.

**Tech Stack:** Next.js 16 App Router · React 19 · Tailwind v4 · GSAP 3 (`useGSAP`) · three.js (raw WebGL via `THREE.ShaderMaterial`, same pattern as `PitchOrbits.tsx`) · existing `useReducedMotion` hook.

**Source design doc:** `docs/plans/2026-05-18-section-05-close-design.md` — read it before starting.

---

## Pre-flight (read these before Task 1)

1. `CLAUDE.md` § "DESKTOP-LED RULE", § "Standing checks", § "What NOT to do".
2. The design doc above.
3. `src/components/section-02/PitchOutputFigure.tsx` — the card hover pattern we're cloning (palette-swapped).
4. `src/components/section-02/PitchOrbits.tsx` — the WebGL orbits we're cloning *structurally* (don't import it; don't touch it).
5. `src/components/section-02/SectionPitch.tsx` + `SectionPitchDesktop.tsx` (first 60 lines) — for the desktop/mobile split convention and the `useReducedMotion` import path.
6. `src/components/floating-cta/FloatingCta.tsx` — do not modify; understand it exists so you can mentally separate it from §05's inline CTA.

## Conventions for this plan

- **No TDD / no vitest** for visual components. §01–§04 don't have unit tests for visuals and adding them here is out of scope. Verification is **manual browser smoke-test at 1440 + 375** per CLAUDE.md.
- **No visual-reviewer subagent.** The user has flagged it as slow/flaky. After each task: take a screenshot manually with Playwright MCP (`mcp__playwright__browser_navigate` → `mcp__playwright__browser_take_screenshot`) and surface it to the user for sign-off before continuing.
- **Commit after every task** with a conventional commit message (`feat:`, `fix:`, `chore:` — see `git log` for tone).
- **No new dependencies.** Three.js, GSAP, `useReducedMotion`, `clsx`, `deferGsap` are all wired.
- **No `data-reveal` attributes on structural wrappers.** Global CSS sets `[data-reveal]{opacity:0}`. Only animated leaves get the marker. §05 has no scroll-driven reveal in scope, so don't add any.

## Open items the plan defers

- **Free pack inventory** — design doc Q1. Gumroad page only exposes "10 textures." Plan ships best-guess copy from the design doc; Task 13 verifies before sign-off.
- **Directory name** — design doc Q2. `section-05/` is intentional even if numbering shifts later; rename is cheap when the time comes.
- **Paid halo palette stops** — design doc Q3. Plan ships a first pass in Task 7, tunes in Task 13.

---

## Task 0: Branch + scaffolding

**Files:**
- Create: `src/components/section-05/SectionClose.tsx`
- Create: `src/components/section-05/SectionCloseDesktop.tsx`
- Create: `src/components/section-05/SectionCloseMobile.tsx`
- Create: `src/components/section-05/PackCard.tsx`
- Create: `src/components/section-05/PackHalo.tsx`
- Create: `src/components/section-05/packData.ts`
- Modify: `src/app/page.tsx`

**Step 1: Confirm branch.**

Check current branch with `git status` (don't switch — current branch `feat/section-02-pitch` has uncommitted CTA work). Ask the user whether to:
- (a) continue on `feat/section-02-pitch` (since pending CTA + design-doc work is parked there), or
- (b) branch off `main` as `feat/section-05-close` and let the CTA branch finish independently.

Wait for an answer. Do not switch branches autonomously.

**Step 2: Create directory + empty exports.**

Each file gets a minimal valid TS export so subsequent tasks don't fight compile errors. Example for `SectionClose.tsx`:

```tsx
import { SectionCloseDesktop } from "./SectionCloseDesktop";
import { SectionCloseMobile } from "./SectionCloseMobile";

export function SectionClose() {
  return (
    <>
      <div className="hidden lg:block"><SectionCloseDesktop /></div>
      <div className="block lg:hidden"><SectionCloseMobile /></div>
    </>
  );
}
```

For `SectionCloseDesktop.tsx` / `SectionCloseMobile.tsx`: return `<section className="py-32" aria-labelledby="close-heading"><h2 id="close-heading">Two ways in.</h2></section>` placeholder.

For `PackCard.tsx`, `PackHalo.tsx`: export named functions that return `null` for now (typed props can come in later tasks — keep the seed file under 10 lines).

For `packData.ts`: `export const packs = {};` placeholder.

**Step 3: Mount in `page.tsx`.**

```tsx
import { SectionClose } from "@/components/section-05/SectionClose";
// …
<SectionRecipe />
<SectionClose />
<div style={{ height: "60vh" }} aria-hidden="true" />
```

Remove the trailing 60vh spacer once §05 has its own bottom breathing room (Task 3) — but keep it for now so the page doesn't shift.

**Step 4: Verify build + smoke-test.**

```bash
pnpm dev
```

Visit `http://localhost:3000`. Expected: page loads, no console errors, "Two ways in." renders below §04 in plain default styling. Both viewports (1440 + 375) — no horizontal scroll.

**Step 5: Commit.**

```bash
git add src/components/section-05 src/app/page.tsx
git commit -m "chore(close): scaffold section-05 directory + mount"
```

---

## Task 1: `packData.ts` — single source of truth for copy

**Files:**
- Modify: `src/components/section-05/packData.ts`

**Step 1: Define the shape.**

```ts
export type PackVariant = "paid" | "free";

export type PackInventoryItem = {
  emoji: string;
  text: string;
};

export type Pack = {
  variant: PackVariant;
  catalogHeader: string;
  name: string;
  tagline: string;
  price: string;
  priceStrap?: string;
  inventory: PackInventoryItem[];
  ctaLabel: string;
  ctaHref: string;
};
```

**Step 2: Populate both packs verbatim from the design doc.**

Use exactly the strings in design doc §"Card anatomy" — including the `·` separators, the superscript `¹`, the en-dash in the price strap, the emoji order. Free-pack inventory is the design-doc best-guess; Task 13 will reconcile against Gumroad.

```ts
export const PAID_PACK: Pack = {
  variant: "paid",
  catalogHeader: "MATERIALS¹ · EDITION 01 · 160 SPECIMENS",
  name: "Materials¹",
  tagline: "The full library. 160 specimens.",
  price: "$9",
  priceStrap: "paid once.",
  inventory: [
    { emoji: "🌄", text: "160 stills" },
    { emoji: "🎥", text: "160 video loops" },
    { emoji: "👻", text: "160 transparent PNGs" },
    { emoji: "✨", text: "5× 4K hero loops" },
    { emoji: "🦸‍♂️", text: "3× hero designs for web" },
    { emoji: "✏️", text: "9× UI card templates" },
    { emoji: "🎓", text: "Mini guide: Materials in AI" },
    { emoji: "🛠️", text: "3 prompts for making your own" },
    { emoji: "📁", text: "Figma file" },
    { emoji: "⚡️", text: "Lifetime updates" },
    { emoji: "🙋‍♂️", text: "Support" },
  ],
  ctaLabel: "Get Materials¹ — $9",
  ctaHref: "#buy",
};

export const FREE_PACK: Pack = {
  variant: "free",
  catalogHeader: "DARK MATERIALS · SERIES Dk · 10 SPECIMENS",
  name: "Dark Materials",
  tagline: "Ten dark Materials. Free, no email.",
  price: "Free",
  inventory: [
    { emoji: "🌄", text: "10 stills" },
    { emoji: "🎥", text: "10 video loops" },
    { emoji: "👻", text: "10 transparent PNGs" },
    { emoji: "⚡️", text: "Free updates" },
  ],
  ctaLabel: "Get Dark Materials",
  ctaHref: "https://dannystuart.gumroad.com/l/Dark-Materials-Abstract-Design-Textures",
};
```

**Step 3: Verify.**

`pnpm tsc --noEmit` (or wait for Next's dev server to recompile). Expected: no type errors.

**Step 4: Commit.**

```bash
git add src/components/section-05/packData.ts
git commit -m "feat(close): pack copy + inventory data"
```

---

## Task 2: `PackCard` static — both variants render correctly without halo or hover

**Files:**
- Modify: `src/components/section-05/PackCard.tsx`

**Step 1: Layout the four zones from the design doc.**

Four zones top-to-bottom: catalog header → name + tagline → price → inventory list → CTA. No halo yet. No hover yet. Use Tailwind utility classes only — no inline styles unless the design tokens demand it.

Component signature:

```tsx
import type { Pack } from "./packData";

type Props = { pack: Pack };

export function PackCard({ pack }: Props) {
  return (
    <article
      className="relative isolate rounded-[20px] border border-white/[0.07] bg-[rgba(14,14,16,0.92)] p-8 font-display text-white"
      data-pack-variant={pack.variant}
    >
      {/* Zone 1: catalog header */}
      <div className="text-[12px] font-medium uppercase tracking-[0.14em] text-white/60">
        {pack.catalogHeader}
      </div>

      {/* Zone 2: name + tagline */}
      <div className="mt-6">
        <h3 className="text-[32px] font-semibold leading-tight tracking-[-0.01em]">
          {pack.name}
        </h3>
        <p className="mt-2 text-[14px] leading-snug text-white/65">
          {pack.tagline}
        </p>
      </div>

      {/* Zone 3: price */}
      <div className="mt-8">
        <div className="text-[44px] font-semibold leading-none">{pack.price}</div>
        {pack.priceStrap ? (
          <div className="mt-1 text-[12px] text-white/55">{pack.priceStrap}</div>
        ) : null}
      </div>

      {/* Zone 4: inventory */}
      <ul className="mt-8 flex flex-col gap-2">
        {pack.inventory.map((item) => (
          <li
            key={item.text}
            className="flex items-start gap-3 text-[14px] leading-snug text-white/85"
          >
            <span aria-hidden="true" className="shrink-0">{item.emoji}</span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>

      {/* Zone 5: CTA */}
      <a
        href={pack.ctaHref}
        className={
          pack.variant === "paid"
            ? "mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-[14px] font-semibold text-[#0A0A0F]"
            : "mt-8 inline-flex h-12 w-full items-center justify-center rounded-full border border-white/20 bg-transparent px-5 text-[14px] font-semibold text-white"
        }
      >
        {pack.ctaLabel}
      </a>
    </article>
  );
}
```

The paid CTA's iridescent edge and the hairline cool-grey detail on free are deferred to Task 9. This is the static skeleton.

**Step 2: Render both cards in the desktop layout temporarily** so we can eyeball them. Edit `SectionCloseDesktop.tsx`:

```tsx
import { PackCard } from "./PackCard";
import { PAID_PACK, FREE_PACK } from "./packData";

export function SectionCloseDesktop() {
  return (
    <section className="py-32" aria-labelledby="close-heading">
      <h2 id="close-heading" className="text-[56px] font-semibold">Two ways in.</h2>
      <div className="mt-24 flex gap-20">
        <div className="w-[440px]"><PackCard pack={PAID_PACK} /></div>
        <div className="w-[440px]"><PackCard pack={FREE_PACK} /></div>
      </div>
    </section>
  );
}
```

No editorial margins yet — the proper left-anchored / right-anchored layout lands in Task 3. This is just to see the cards.

**Step 3: Smoke-test.**

`pnpm dev`. Navigate to `/`. Scroll to bottom. Expected: two cards visible side by side, paid taller than free, all copy renders, no overflow.

**Step 4: Take a screenshot** with Playwright MCP at 1440 viewport, surface to user for sanity check.

**Step 5: Commit.**

```bash
git add src/components/section-05/PackCard.tsx src/components/section-05/SectionCloseDesktop.tsx
git commit -m "feat(close): static pack card (both variants)"
```

---

## Task 3: Desktop editorial layout

**Files:**
- Modify: `src/components/section-05/SectionCloseDesktop.tsx`

**Step 1: Apply editorial margins matching §01/§02.**

§01's hero offsets at `min-[1600px]:left-[12vw]` and `min-[2200px]:left-[20vw]`. §05 uses the same rhythm — read `src/components/hero/HeroDesktop.tsx` (or whichever §01 file currently sets these offsets) for the exact class chain before writing yours, so they match. The headline is left-anchored, the sign-off right-anchored.

Layout (illustrative — adjust against the live page):

```tsx
<section
  className="relative py-32"
  aria-labelledby="close-heading"
>
  {/* Headline — left-anchored, in the §01/§02 left rhythm */}
  <div className="px-12 min-[1600px]:px-[12vw] min-[2200px]:px-[20vw]">
    <h2
      id="close-heading"
      className="text-[56px] font-semibold leading-[1.15] tracking-[-0.0334em]"
    >
      Two ways in.
    </h2>
  </div>

  {/* Cards — centered relative to their own column block */}
  <div className="mt-24 flex justify-center gap-20">
    <div className="w-[440px] self-start">
      <PackCard pack={PAID_PACK} />
    </div>
    <div className="w-[440px] self-start">
      <PackCard pack={FREE_PACK} />
    </div>
  </div>

  {/* Sign-off — right-anchored */}
  <div className="mt-16 px-12 min-[1600px]:px-[12vw] min-[2200px]:px-[20vw] text-right">
    <p className="text-[14px] text-white/65">Have fun ✌️ — Danny</p>
  </div>
</section>
```

Key requirements (verify against the design doc):
- Cards are **equal width, unequal height** — paid taller because it has more inventory rows. `self-start` (not `self-stretch`) keeps free card shorter. Don't equalize.
- Gap between cards ~80px (`gap-20`).
- Headline → cards ~96px (`mt-24`).
- Cards → sign-off ~64px (`mt-16`).
- `py-32` top/bottom for breathing room.

**Step 2: Smoke-test at 1440.**

Verify: headline left, sign-off right, cards centered as a pair, paid card visibly taller. No horizontal scroll. No center-aligned SaaS-template feel.

**Step 3: Screenshot + surface to user** for layout sign-off before adding halos/hover.

**Step 4: Commit.**

```bash
git add src/components/section-05/SectionCloseDesktop.tsx
git commit -m "feat(close): desktop editorial layout (headline / cards / sign-off)"
```

---

## Task 4: Mobile stack

**Files:**
- Modify: `src/components/section-05/SectionCloseMobile.tsx`

**Step 1: Vertical stack with 24px gutters.**

```tsx
import { PackCard } from "./PackCard";
import { PAID_PACK, FREE_PACK } from "./packData";

export function SectionCloseMobile() {
  return (
    <section className="px-6 py-20" aria-labelledby="close-heading-m">
      <h2
        id="close-heading-m"
        className="text-[40px] font-semibold leading-[1.15] tracking-[-0.025em]"
      >
        Two ways in.
      </h2>

      <div className="mt-12 flex flex-col gap-12">
        <PackCard pack={PAID_PACK} />
        <PackCard pack={FREE_PACK} />
      </div>

      <p className="mt-12 text-[14px] text-white/65">Have fun ✌️ — Danny</p>
    </section>
  );
}
```

Per CLAUDE.md mobile rules: `px-6` (24px) gutters, tap targets ≥44px (CTA already `h-12` = 48px), no horizontal scroll. The headline drops from 56px → 40px because it's narrower on mobile; verify against §01/§02 mobile equivalents and align with whatever they do.

**Step 2: Smoke-test at 375.**

Verify: vertical stack, no horizontal scroll, both cards fit, CTAs hit 44px+, headline doesn't break awkwardly.

**Step 3: Screenshot + surface to user** at 375.

**Step 4: Commit.**

```bash
git add src/components/section-05/SectionCloseMobile.tsx
git commit -m "feat(close): mobile stacked layout"
```

---

## Task 5: Gradient-word accent on "in"

**Files:**
- Modify: `src/components/section-05/SectionCloseDesktop.tsx`
- Modify: `src/components/section-05/SectionCloseMobile.tsx`

**Step 1: Find the existing gradient-word implementation in §01.**

Look at the hero headline ("creative" gradient word). Read `src/components/hero/HeroHeadline.tsx` (or current hero headline file) — it uses `linear-gradient(90deg, #A855F7 0%, #F97316 100%)` with `bg-clip-text text-transparent`. The exact class string lives there; reuse it verbatim so the two gradient words feel like siblings.

**Step 2: Wrap "in" in both headlines.**

```tsx
<h2 ...>
  Two ways{" "}
  <span className="bg-[linear-gradient(90deg,#A855F7_0%,#F97316_100%)] bg-clip-text text-transparent">
    in
  </span>
  .
</h2>
```

Both desktop and mobile. The period stays outside the gradient span so the punctuation doesn't pick up the gradient (matches §01's treatment).

**Step 3: Smoke-test + screenshot at 1440 and 375.** Surface for sign-off — this is the section's only ornament so it has to land.

**Step 4: Commit.**

```bash
git add src/components/section-05/SectionCloseDesktop.tsx src/components/section-05/SectionCloseMobile.tsx
git commit -m "feat(close): gradient-word accent on \"in\""
```

---

## Task 6: `PackHalo` — static WebGL field (no animation yet)

**Files:**
- Modify: `src/components/section-05/PackHalo.tsx`

**Critical:** This is a new component built from scratch. **Do not import `PitchOrbits.tsx`. Do not modify `PitchOrbits.tsx`.** The user has explicitly locked it. Use it as *reference only*.

**Step 1: Define a palette type and component props.**

```ts
export type HaloPalette = {
  base: [number, number, number];   // hairline / resting ring color (RGB 0–1)
  hot:  [number, number, number];   // bloom core
  warm: [number, number, number];   // accent A (pulse tint)
  cool: [number, number, number];   // accent B (shimmer tint)
};

type Props = {
  className?: string;
  palette: HaloPalette;
  /** Resting intensity multiplier — paid 0.6, free 0.3. */
  restingIntensity: number;
  /** Per-card halo geometry. */
  viewBox: [number, number];
  center: [number, number];
  radii: [number, number, number]; // 3 rings (vs §02's 5)
  /** Pulse phase offset in [0,1). Paid 0, free 0.5. */
  phaseOffset?: number;
};
```

**Step 2: Implement as a WebGL component.**

Mirror `PitchOrbits.tsx`'s lifecycle:
- `useEffect` block that constructs `THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: "low-power" })`.
- `OrthographicCamera(-1, 1, 1, -1, 0, 1)` + a full-screen `PlaneGeometry(2, 2)`.
- A `ShaderMaterial` with vertex shader identical to §02's (passes uv through).
- Fragment shader is the *same structure* as §02 but with `RING_COUNT = 3`, palette uniforms instead of hardcoded `baseCol/hotCol/warmCol/coolCol`, no pointer/parallax (cards don't need cursor parallax on the halo), and the pulse cycle period is `10.0` seconds (vs §02's 7.0).
- `ResizeObserver` + `IntersectionObserver` lifecycle exactly as §02.
- RAF loop sets `uTime` and renders only when visible.
- Cleanup disposes geometry, material, renderer, and removes the canvas from the container.

**Pulse-phase change vs §02:**

```glsl
float cyclePeriod = 10.0;
float phase = mod(t + uPhaseOffset * cyclePeriod, cyclePeriod) / cyclePeriod;
```

`uPhaseOffset` is a new uniform — paid passes `0.0`, free passes `0.5`. Result: their rings never pulse in sync.

**Step 3: Wire palette as uniforms.**

Pass each palette color as a `THREE.Vector3` uniform:

```ts
uBaseCol: { value: new THREE.Vector3(...palette.base) },
uHotCol:  { value: new THREE.Vector3(...palette.hot) },
uWarmCol: { value: new THREE.Vector3(...palette.warm) },
uCoolCol: { value: new THREE.Vector3(...palette.cool) },
uIntensity: { value: restingIntensity },
uPhaseOffset: { value: phaseOffset ?? 0 },
```

Multiply the final `colOut` and `aOut` by `uIntensity` so resting intensity scales cleanly.

**Step 4: For this task only, set `pulse = 0.0` in the shader** (comment out the pulse contribution). We're verifying the static field renders before adding motion.

**Step 5: Render the halos behind each card.**

In `PackCard.tsx`, before this task `PackCard` had no halo. Now we add the halo as a sibling, not a child of the card:

In the card markup, wrap the existing `<article>` and add a `PackHalo` *behind* it via a parent container with `relative` positioning:

```tsx
<div className="relative isolate">
  <PackHalo
    className="pointer-events-none absolute -inset-[35%] -z-10"
    palette={pack.variant === "paid" ? PAID_HALO : FREE_HALO}
    restingIntensity={pack.variant === "paid" ? 0.6 : 0.3}
    viewBox={[2, 2]}
    center={[1, 1]}
    radii={[0.55, 0.85, 1.25]}
    phaseOffset={pack.variant === "paid" ? 0 : 0.5}
  />
  <article ...>{/* existing card markup */}</article>
</div>
```

`-inset-[35%]` matches the design doc's "outermost ring extends ~35% past card edges."

**Step 6: Define `PAID_HALO` and `FREE_HALO` palettes** in `packData.ts`:

```ts
import type { HaloPalette } from "./PackHalo";

// Free reuses §02's palette directly (blue → violet).
export const FREE_HALO: HaloPalette = {
  base: [0.655, 0.769, 0.910],
  hot:  [0.96, 0.98, 1.00],
  warm: [0.66, 0.33, 0.97],   // violet — was §02's warm slot
  cool: [0.33, 0.59, 0.93],   // blue —  matches §02 cool
};

// Paid — first-pass warm → iridescent magenta. Tune in Task 13.
export const PAID_HALO: HaloPalette = {
  base: [0.95, 0.78, 0.55],   // amber hairline
  hot:  [1.00, 0.95, 0.90],   // warm core
  warm: [0.98, 0.46, 0.18],   // orange-red (echoes #F97316)
  cool: [0.85, 0.27, 0.70],   // iridescent magenta
};
```

**Step 7: Smoke-test + screenshot.**

Expected at 1440: cool blueish field behind free card, warm amber/magenta field behind paid card. Static — no animation. Field extends visibly past card edges. Both halos visible but quiet (resting intensities 0.6 and 0.3). No console errors.

**Step 8: Commit.**

```bash
git add src/components/section-05/PackHalo.tsx src/components/section-05/PackCard.tsx src/components/section-05/packData.ts
git commit -m "feat(close): static twin halos (WebGL, 3 rings, per-pack palette)"
```

---

## Task 7: Halo pulse animation

**Files:**
- Modify: `src/components/section-05/PackHalo.tsx`

**Step 1: Re-enable the pulse contribution** in the fragment shader (removed in Task 6 Step 4). Confirm `cyclePeriod = 10.0` and the `uPhaseOffset` shift is in.

**Step 2: Verify the two halos pulse out of phase.**

Smoke-test at 1440. Watch both halos for ~20 seconds (two full cycles). Expected: rings pulse outward ring-by-ring on a ~10s cycle, paid and free never peak together. If they look in sync, re-check `uPhaseOffset` is actually applied in the shader (not just declared).

**Step 3: Verify `useReducedMotion` still freezes the field.**

In Chrome devtools: `Rendering → Emulate CSS media feature prefers-reduced-motion → reduce`. Halos should freeze (no pulse, no rotation). The `uReduced` uniform mirroring §02's logic must be in place.

**Step 4: Screenshot at 1440. Surface a short screen recording or stills at two cycle phases** so the user can sanity-check the motion calm.

**Step 5: Commit.**

```bash
git add src/components/section-05/PackHalo.tsx
git commit -m "feat(close): halo pulse cycle (10s, opposing phases)"
```

---

## Task 8: Card hover system — lit edge + behind-card bloom + scale + text bloom

**Files:**
- Modify: `src/components/section-05/PackCard.tsx`

This is the §02 `PitchOutputFigure` hover system, palette-swapped per variant. Read `PitchOutputFigure.tsx` lines 30–145 first — copy the pattern, don't import the component.

**Step 1: Add the pointer-tracking handler + CSS vars.**

```tsx
import { useRef } from "react";

// inside PackCard:
const cardRef = useRef<HTMLDivElement>(null);
const wrapRef = useRef<HTMLDivElement>(null);

function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
  const card = cardRef.current;
  const wrap = wrapRef.current;
  if (!card || !wrap) return;
  const rect = card.getBoundingClientRect();
  wrap.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  wrap.style.setProperty("--my", `${e.clientY - rect.top}px`);
}
```

Apply to the outermost wrapper (the `relative isolate` div from Task 6). Set `--mx: 50%; --my: 50%` as defaults in inline style.

**Step 2: Add three hover overlays inside the wrapper:**

1. **Behind-card bloom** — sibling of `<article>`, positioned `absolute -inset-20`, opacity 0 by default, opacity 1 on `group-hover`. `transition-opacity duration-500 ease-out`. Background is a `radial-gradient(260px circle at calc(var(--mx) + 80px) calc(var(--my) + 80px), …)` with palette-swapped stops:
   - Paid: warm/iridescent — `rgba(249,115,22,0.55)`, `rgba(168,85,247,0.18) 40%`, transparent 65%.
   - Free: §02 stops — `rgba(83,149,237,0.6)`, `rgba(168,85,247,0.18) 40%`, transparent 65%.
2. **Card scale** — add to the `<article>` className: `group-hover:scale-[1.055] transition-transform duration-[1100ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] will-change-transform`.
3. **Lit edge** — sibling of `<article>` (or absolutely-positioned overlay inside it at z-30), `rounded-[20px]`, `padding: 1px`, background `radial-gradient(200px circle at var(--mx) var(--my), …)`, masked with the dual-mask `xor`/`exclude` trick from §02 lines 130–143. Palette-swapped:
   - Paid: `rgba(255,255,255,0.95)`, `rgba(255,180,140,0.55) 35%`, transparent 65%.
   - Free: §02 stops — `rgba(255,255,255,0.95)`, `rgba(140,180,255,0.55) 35%`, transparent 65%.

The wrapper gets the `group` class so descendant `group-hover:*` selectors fire.

**Step 3: Text color bloom.**

In the existing markup, change:
- `<h3>` add `text-white/85 transition-colors duration-500 ease-out group-hover:text-white`.
- Tagline `<p>` add `text-white/65 transition-colors duration-500 ease-out group-hover:text-white/90`.

**Step 4: Verify pointer events.**

The halo wrapper must stay `pointer-events-none` (it is — Task 6). The wrapper that handles `onPointerMove` is the new `group` div, not the halo. Test by moving the cursor across the card — the lit edge should track the cursor.

**Step 5: Smoke-test.**

Hover each card: scale up to 1.055, lit edge follows cursor, behind-card bloom appears, text whitens. Different palettes per variant. Easing feels long (1100ms) and luxurious — same vibe as §02's cards.

**Step 6: Mobile sanity-check.**

On mobile viewport (375): the hover system shouldn't fire on tap (no `:hover` on touch). The cards remain static. If you see flicker on tap, follow §02's pattern (no extra work usually needed — `group-hover` simply doesn't trigger on touch devices).

**Step 7: Screenshots — one at rest, one mid-hover on each card.** Surface to user.

**Step 8: Commit.**

```bash
git add src/components/section-05/PackCard.tsx
git commit -m "feat(close): card hover (lit edge + bloom + scale + text bloom)"
```

---

## Task 9: Iridescent edge on paid CTA, hairline cool-grey on free CTA

**Files:**
- Modify: `src/components/section-05/PackCard.tsx`

**Step 1: Paid CTA — iridescent edge.**

Replace the plain `bg-white` paid CTA with a button that has an iridescent border sampling the paid halo palette. Use the same mask trick as the card's lit edge, but applied to the button's border only:

```tsx
<a
  href={pack.ctaHref}
  className="relative mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-[14px] font-semibold text-[#0A0A0F]"
>
  <span
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 rounded-full"
    style={{
      padding: "1px",
      background:
        "linear-gradient(90deg, rgba(249,115,22,0.9) 0%, rgba(217,70,179,0.9) 100%)",
      WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
      mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
    }}
  />
  <span className="relative">{pack.ctaLabel}</span>
</a>
```

**Step 2: Free CTA — hairline cool-grey border, no iridescence.**

Already in place from Task 2 (`border border-white/20`). Confirm it's hairline and stays subdued — no glow.

**Step 3: Variant-branch in the render.**

```tsx
{pack.variant === "paid" ? <PaidCta pack={pack} /> : <FreeCta pack={pack} />}
```

Two small subcomponents in the same file keep the JSX readable.

**Step 4: Smoke-test + screenshot at 1440.** Paid CTA edge should feel like it samples the halo — warm/magenta. Free CTA reads as a quiet secondary action.

**Step 5: Commit.**

```bash
git add src/components/section-05/PackCard.tsx
git commit -m "feat(close): paid CTA iridescent edge, free CTA hairline"
```

---

## Task 10: Halo brightens on card hover, decays on leave

**Files:**
- Modify: `src/components/section-05/PackHalo.tsx`
- Modify: `src/components/section-05/PackCard.tsx`

**Step 1: Expose an imperative API on `PackHalo`.**

Forward a ref or accept a `hoveredRef: React.RefObject<boolean>` prop. Cleanest: add a `boostRef` prop typed `React.MutableRefObject<number>` — the parent sets it to 1.0 on enter, 0.0 on leave, and the RAF loop lerps `uIntensity` between `restingIntensity` and `restingIntensity * 1.5` based on a smoothed version of `boostRef.current`.

Inside the RAF frame:

```ts
const target = restingIntensity * (1 + 0.5 * (boostRef?.current ?? 0));
smoothedIntensity += (target - smoothedIntensity) * Math.min(1, dt * (boostRef?.current ? 4 : 1.7));
uniforms.uIntensity.value = smoothedIntensity;
```

The asymmetric lerp speed (faster up, slower down) gives the design doc's "decays back to resting intensity over 600ms when cursor leaves" feel.

**Step 2: Wire from `PackCard`.**

```tsx
const boostRef = useRef(0);

// on the wrapper:
onPointerEnter={() => { boostRef.current = 1; }}
onPointerLeave={() => { boostRef.current = 0; }}

// pass to halo:
<PackHalo ... boostRef={boostRef} />
```

**Step 3: Verify.**

Hover paid card: warm halo visibly brightens, ~1.5×. Leave: halo dims back over ~600ms. Same for free (subtler since resting is lower). The halo + local hover light should feel like one system, not two competing effects.

**Step 4: Reduced-motion check.**

When `prefers-reduced-motion: reduce`, the halo is already frozen but the resting intensity should still respond to hover (it's not motion, it's brightness). Confirm that lerp still runs — only the time-based pulse/rotation freezes. If unsure, biased to "still allow brightness change" since reduced-motion is about motion, not visibility.

**Step 5: Smoke-test + screenshot mid-hover + at-rest for both cards.** Surface.

**Step 6: Commit.**

```bash
git add src/components/section-05/PackHalo.tsx src/components/section-05/PackCard.tsx
git commit -m "feat(close): halo brightens on card hover, decays on leave"
```

---

## Task 11: Reduced-motion fallback audit

**Files:**
- Read-only review of `PackHalo.tsx`, `PackCard.tsx`

**Step 1: Toggle `prefers-reduced-motion: reduce`** in devtools.

Verify each:
- **Halo pulse:** frozen (no ring pulse, no rotation). Static low-intensity radial field remains.
- **Card scale on hover:** suppressed. `useReducedMotion()` returns true → either remove the `group-hover:scale-[1.055]` class or wrap the transform behind a class toggle. Simplest fix: add `motion-reduce:transform-none` Tailwind variant alongside `group-hover:scale-[1.055]`.
- **Lit-edge and behind-card bloom on hover:** the design doc says hover *keeps* color bloom on label/caption but drops scale and cursor tracking. To drop cursor tracking, gate `handlePointerMove` on `useReducedMotion()`:

```tsx
const reducedMotion = useReducedMotion();

function handlePointerMove(e) {
  if (reducedMotion) return;
  // ...
}
```

This leaves `--mx`/`--my` at their defaults (50%, 50%), so the lit edge becomes a static centered halo — softer effect, still visible.

**Step 2: Smoke-test with reduced-motion on.** Cards remain calm; text color bloom on hover still fires (because it's a color transition, not transform, and the design doc explicitly keeps it).

**Step 3: Screenshot at 1440 with reduced-motion** for archive.

**Step 4: Commit if any code changed.**

```bash
git add src/components/section-05/PackCard.tsx
git commit -m "fix(close): reduced-motion drops card scale + cursor tracking"
```

---

## Task 12: Accessibility pass

**Files:**
- Modify: `src/components/section-05/PackCard.tsx`, `PackHalo.tsx`, `SectionCloseDesktop.tsx`, `SectionCloseMobile.tsx`

**Step 1: Verify halo is `aria-hidden`.**

`PackHalo` already returns a `<div aria-hidden="true">` (mirror §02). Confirm.

**Step 2: Verify cards aren't nested in `<a>`.**

The CTA `<a>` lives *inside* the card. Cards themselves are `<article>`, not `<a>`. Per design doc.

**Step 3: Tab order check.**

Use Chrome devtools' "Show tab order" or just keyboard-Tab through the page from §04 forward. Expected order arriving at §05:
1. (Hero CTAs, §02 cards, §03 nav, §04 controls — whatever exists upstream)
2. Paid CTA button
3. Free CTA button
4. (Floating CTA, if still focusable when §05 is in view)

The headline (`<h2>`) is non-focusable. Sign-off (`<p>`) is non-focusable. No focus traps.

**Step 4: Focus styles on both CTAs.**

The current CTAs have no explicit focus ring. The floating CTA uses a `.cta-focus-ring` class (see `floating-cta/FloatingCta.tsx:91`). Decide:
- (a) reuse `cta-focus-ring` for both pack CTAs (probably correct — visual consistency), or
- (b) inline focus styles (`focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2`).

Default to (a). Verify the class is defined in `globals.css` and applies cleanly to `<a>` elements.

**Step 5: Catalog header readability.**

The catalog header is plain `<div>` with text content — readable to screen readers (design doc requirement). Verify it's *not* `aria-hidden`. The `·` separators read as "dot" or are skipped depending on reader settings — that's fine, matches §01.

**Step 6: Keyboard activation.**

Press Enter on each focused CTA. Paid → navigates to `#buy`. Free → navigates to the Gumroad URL. (Test the Gumroad link opens in a new tab if that's intended — design doc doesn't say. Default to same-tab unless you want to add `target="_blank" rel="noopener noreferrer"`. Ask before adding.)

**Step 7: Commit any fixes.**

```bash
git add src/components/section-05
git commit -m "fix(close): a11y — focus ring on pack CTAs, tab order verified"
```

---

## Task 13: Final polish — halo palette tuning, free inventory reconciliation, full smoke test

**Step 1: Reconcile free pack inventory with the Gumroad listing.**

Open `https://dannystuart.gumroad.com/l/Dark-Materials-Abstract-Design-Textures` in a browser. Compare the actual listed contents against the best-guess inventory in `packData.ts`. Update `FREE_PACK.inventory` to match the source of truth. Ask the user to confirm the corrected list before commit if anything's ambiguous.

**Step 2: Halo palette pass — paid card.**

Take 1440 screenshots showing the paid card halo at rest and during pulse peak. Surface to user. Iterate `PAID_HALO`'s `warm` / `cool` stops until the warmth reads as designed — amber-leaning at the core, magenta shimmer on the outer ring. Expect 1–3 small iterations. Free halo should be untouched (already matches §02).

**Step 3: Full standing-checks sweep** (from CLAUDE.md):

**Desktop 1440×900:**
- Section reads asymmetric, off-centre — headline left, sign-off right, cards centered between. ✓
- Type scale, weights, spacing match locked tokens (no rogue values). ✓
- Element boxes — *none in §05.* (Design doc doesn't introduce element boxes here; that's a §02 / future-section tool.)
- Gradient-word accent — single word ("in"), sampled from hero family. ✓
- No console errors or warnings.

**Mobile 375×667:**
- Tap targets ≥44px (CTAs are h-12 = 48px). ✓
- No horizontal scroll.
- Text doesn't break / overflow.
- 24px gutters (`px-6`). ✓
- Section's job lands — both packs visible, choice obvious.
- Reduced-motion fallback in place. ✓

**Step 4: Cross-section regression check.**

Scroll the whole page top-to-bottom at 1440 and 375. Confirm:
- §01–§04 visuals unchanged. (No files outside `section-05/` and `page.tsx` were modified.)
- `FloatingCta.tsx` still behaves exactly as before — pulse, magnetic pointer, scroll reveal. (No changes made to it.)
- No layout shift in earlier sections from the new section mount.

**Step 5: Final screenshots** at 1440 and 375, both at rest and mid-hover. Surface to user for sign-off.

**Step 6: Commit final tweaks.**

```bash
git add src/components/section-05
git commit -m "chore(close): final halo palette + inventory reconciliation"
```

---

## Done criteria

- [ ] Both cards render at 1440 with editorial diagonal: headline left, sign-off right.
- [ ] Both cards stack cleanly on mobile (375), no horizontal scroll.
- [ ] Halos render behind each card; paid warm, free cool; both pulse at 10s offset.
- [ ] Card hover — lit edge tracks cursor, behind-card bloom appears, card scales 1.055×, text whitens, halo brightens 1.5× and decays.
- [ ] Gradient-word "in" rendered with hero gradient.
- [ ] Paid CTA has iridescent edge; free CTA has hairline cool-grey border.
- [ ] Reduced-motion: halo frozen, card scale suppressed, cursor tracking gated, color bloom remains.
- [ ] `FloatingCta.tsx` is unchanged (verify with `git log -- src/components/floating-cta/`).
- [ ] `PitchOrbits.tsx` is unchanged (verify with `git log -- src/components/section-02/PitchOrbits.tsx`).
- [ ] Free pack inventory matches the Gumroad listing.
- [ ] No console errors on either viewport.

## Out of scope (explicitly)

- Modifying `FloatingCta.tsx` (user-locked).
- Modifying any §02 file (user-locked).
- Floating-CTA fade-out integration on §05 entry (design doc proposes it; this plan drops it per user instruction).
- ScrollTrigger / scroll-driven reveal on §05 (no motion-heavy moment here per design doc).
- Extracting shared primitives (`HoveringCard.tsx`, `OrbitsField.tsx`) — wait for the third recurrence per CLAUDE.md.
- Unit tests for visual components — no precedent in §01–§04; smoke-test + screenshots is the verification path.
- Visual-reviewer subagent — slow/flaky per user; replaced with manual Playwright MCP screenshots surfaced to user.
