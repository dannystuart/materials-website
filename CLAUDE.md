@AGENTS.md

# Project: Materials¹ landing page

Stack: Next.js 16 (App Router) · React 19 · Tailwind v4 · Plus Jakarta Sans · GSAP 3 (`useGSAP` + `ScrollTrigger`) · pnpm · vitest.
Dev server: `pnpm dev` → http://localhost:3000

The hero (§01) is built and locked. Build §02 onwards section-by-section. The creative brief at `docs/plans/materials-hifi-creative-brief.md` is the source of truth for voice, directions, and aesthetic. The Claude Code playbook at `docs/plans/claude-code-website-playbook.md` describes the build/review loop.

## Brand & voice

Designer-to-designer. Warm, casual, not corporate, not breathless. Buyer is a peer.

**Banned words (no exceptions):** unlock, elevate, supercharge, transform, seamlessly, effortlessly, robust, powerful, comprehensive, breathtaking, game-changing, revolutionary, level up, take to the next level, cutting-edge, next-gen.

**Don't lead with "AI-powered" or "AI-generated assets."** Materials are for AI work as much as of AI work. The AI angle earns its place when the dual-use story is told, not as headline framing.

The words "stunning" and "curated" appear only inside quoted testimonials — banned from page copy.

## Design tokens (extracted from §01 code)

**Typeface:** Plus Jakarta Sans (Google Fonts) — weights 400, 500, 600, 700. No mono. CSS variable `--font-jakarta`, Tailwind class `font-display`. Catalog feel comes from weight differential, size ratios, caps + tracking on metadata, and layout — not typeface contrast.

**Palette (current)**
- `--color-hero-bg` `#010100` — page background (near-pure black). Tailwind class `bg-hero-bg`.
- White `#FFFFFF` — primary text.
- Bottom-edge blue gradient: `rgba(44,94,160,0.3)` (deeper) layered under `rgba(83,149,237,0.3)` (lighter) with `mix-blend-mode: plus-lighter`, both radial ellipses anchored at 50% 100%. This is the entire page-level atmospheric move.
- "Creative" gradient: `linear-gradient(90deg, #A855F7 0%, #F97316 100%)` (purple → orange-red). NOTE: the brief describes this as "purple-to-pink"; the code is purple-to-orange. Flag before extending.

**Type scale (hero only — extend as sections build)**
- Hero headline: 56px / line-height 1.15 / letter-spacing -1.87px / weight 600 (semibold).
- Wordmark: SVG, 292px wide.
- (Display / h2 / h3 / lead / body / caps / micro to be locked when §02 establishes them.)

**Spacing (hero)**
- Mobile: `px-6` (24px) gutters, `pt-12` top, `gap-8` between stacked elements.
- Desktop: `left-12` logo offset, `right-24` headline offset, with `min-[1600px]` and `min-[2200px]` breakpoints pulling further into the viewport (`12vw` / `14vw` then `20vw` / `22vw`).

**Hero video treatment**
- Radial mask: `radial-gradient(ellipse 72% 68% at center, #000 35%, transparent 92%)` — Material fades into the page at its edges, no hard rectangle.

## Visual primitives (paired — periodic-table identity)

Treat these as a coupled system. Element boxes say *"this Material has a designation"*; technical grid lines say *"this is the reference field that designation lives in."* Either one without the other reads weaker than both together.

- **Element box.** Invented per-Material designation in the form `014 / Mt / matte`, `027 / Gl / gloss`, `051 / Cr / chrome`. Three-digit ID, two-letter symbol, category name. Site-only — must not appear inside the downloaded product (file names, Figma file, Gumroad listing). Three sizes / three contexts max; don't apply everywhere or the system flattens into decoration. Categories: Mt matte · Gl gloss · Cr chrome · Fl fluid · Or organic · Vb vibrant · Ds dust/textured · Ic iridescent. Decorative element boxes are `aria-hidden`.
- **Technical grid lines.** Hairline (≤1px) cool-grey / muted-blue, low contrast. Concentric arcs, fine dots, ruled grids, occasional radial fans, light tick marks. Reads like instrumentation diagrams or periodic-table reference plates — *scientific catalog*, not *blueprint*. Never carry the eye; texture not content. Plus Jakarta Sans caps with tight tracking for any associated labels (axis values, figure numbers, coordinates).

Not yet built — first instance lands in §02 onwards.

## Type ornament: the gradient-word accent

The hero's `creative` rendered in an iridescent gradient is the type system's **only** ornament.

- **One word per section, maximum.** Stops working if it appears everywhere.
- **Never on a section opener, metadata, or caption.** Only on display or lead copy where a single word carries emphasis.
- **Gradient values sample from actual Material colours** so typography and product read as one system.
- 2–3 gradient values to be locked once §02–§03 establish which Materials feature. Hero uses purple-to-orange.

## Motion philosophy

Two motion-heavy moments per page, max. The rest is calm. Save motion for where it carries an argument — the transformation, the comparison, the kinetic library. Don't add motion for atmosphere alone. Pre-name the two motion moments before building.

GSAP + `useGSAP` + `ScrollTrigger` already wired (see `src/lib/gsap.ts`). `useReducedMotion` hook exists (`src/components/hero/useReducedMotion.ts`) — every motion-driven element gets a reduced-motion fallback. No exceptions.

## DESKTOP-LED RULE (project override)

This project is desktop-led. **1440px is the primary canvas.** Build for desktop first, adapt to mobile (375px) *in the same iteration* — not as a deferred pass. Mobile has to ship and work, but it isn't the lead constraint. The visual-reviewer tests **desktop first**; a desktop FAIL is the priority. *This overrides the playbook's mobile-first default.*

## Standing checks (apply to every section)

**Desktop (1440×900)**
- Section reads at intended editorial pace — asymmetric, off-centre, not centred SaaS templates.
- Type scale, weights, spacing match the locked tokens; no rogue values.
- Element boxes (if present) sit on a grid line / tick / hairline; aren't floating decoration.
- Gradient-word accent (if present) is a single word, sampled from a Material colour.
- No console errors or warnings.

**Mobile (375×667)**
- Tap targets ≥44px.
- No horizontal scroll.
- Text doesn't break or overflow.
- 24px gutters preserved (`px-6`).
- Section's job still lands — none hidden, none radically restructured.
- `prefers-reduced-motion` fallback for any motion-driven element.

## Verification protocol

After ANY UI build or change, invoke the `visual-reviewer` subagent before claiming the work is done. The reviewer hits a running dev server, takes screenshots at 1440 and 375 (desktop first), writes a report, and recommends fixes. **Loop until the report is PASS at both viewports.** No "done" without it.

## What NOT to do

- No warm atmospheric backgrounds. Page chrome stays cool dark. Materials are the only heat source. The hero's bottom blue gradient is the entire page-level atmosphere.
- No serif italic display headlines. The gradient-word treatment is doing that job.
- No neon-lime CTAs. Button accents come from the Materials' own iridescent palette.
- No mono typeface — even for metadata. Plus Jakarta Sans caps + tight tracking carry the catalog energy.
- No centred SaaS-template compositions. The hero's asymmetric, editorial pace continues.
- No founder photo, no comparison tables, no exit-intent modals, no fabricated social proof (see brief §Not on the page).
- Don't extend the palette without asking. Don't introduce a second typeface. Don't add motion for ambience.
- Don't apply element boxes or grid lines everywhere — they flatten into decoration if over-used.

## File map

- `docs/plans/materials-hifi-creative-brief.md` — section-level creative brief (source of truth)
- `docs/plans/claude-code-website-playbook.md` — build/review workflow
- `.claude/agents/visual-reviewer.md` — the reviewer subagent (desktop-first, project-inverted)
- `src/components/hero/*` — §01 (built, locked)
- `src/app/globals.css` — Tailwind + theme tokens
- `src/lib/gsap.ts` — GSAP/ScrollTrigger setup
- `design-system.md` — TBD: primitives get promoted here on third recurrence (two = coincidence, three = system)
