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

## Design tokens

> **Source of truth: `design-system.md` at repo root** (locked Session 1, 2026-06-01). The summary below is the quick reference; `design-system.md` has the full per-format tables, the spacing scale, and the primitive specs. Tokens are encoded in `src/app/globals.css` (`@theme` colours/breakpoints, `:root` type/gradient/atmosphere vars, and the `.t-*` responsive type classes). Sections migrate onto them in Session 2.

**Typeface:** Plus Jakarta Sans (Google Fonts) — weights 400, 500, 600, 700. No mono. CSS variable `--font-jakarta`, Tailwind class `font-display`. Catalog feel comes from weight differential, size ratios, caps + tracking on metadata, and layout — not typeface contrast.

**Palette (closed — do not extend without sign-off)**
- `--color-hero-bg` `#010100` — page background (near-pure black). Tailwind `bg-hero-bg`.
- White `#FFFFFF` — primary text. Ink ladder (opacity on white): secondary `70%` · tertiary `55%` · muted `45%` · faint `35%` · hairline `8%`. Use only these rungs.
- **Atmosphere blue** (the only page-level atmosphere, cool, bottom-anchored): deep `rgb(44,94,160)` + light `rgb(83,149,237)`, `mix-blend-mode: plus-lighter`, radial ellipses at 50% 100%. ⚠ opacity drift: hero uses `0.3`, footer uses `0.18` — kept deliberately ("stronger at open, softer at close"); see `design-system.md §4.2`. §05 card-cluster ambient variant `rgb(96,142,224)`.
- **Material gradients** (the only warm source): creative `linear-gradient(90deg, #A855F7 0%, #F97316 100%)` (hero/CTA) · library `linear-gradient(90deg, #F472B6 0%, #FB923C 50%, #FACC15 100%)` (§03) · material shimmer `linear-gradient(100deg, #A855F7, #F472B6, #F97316, #F472B6, #A855F7)` (§04). ⚠ brief says "purple-to-pink"; code is purple-to-orange — code is canonical.
- **Material colour seeds** (gradient-words sample these): violet `#A855F7` · pink `#F472B6` · orange `#F97316` · amber `#FB923C` · yellow `#FACC15`.
- **Plate** (library card's inverted light surface): bg `#F4F4F6` · ink `#0B0B0E` · label `#5B5BD6`. Tailwind `bg-plate-bg` / `text-plate-ink` / `text-plate-label`.

**Type scale (LOCKED — full per-format tables in `design-system.md §2`)**

Nine levels on a 4px grid (larger sizes strict ÷4; small end fine-tunes). Sizes are mobile / tablet / **desktop**. Apply via the `.t-*` classes (e.g. `className="t-display"`) — they bake in size + leading + tracking + weight responsively.

| token | mobile / tablet / **desktop** | leading | tracking | weight | used by |
|---|---|---|---|---|---|
| `mega` | 44 / 60 / **72** | 1.05 | −0.033em | 600 | §02 pitch (one big moment) |
| `display` | 40 / 48 / **56** | 1.10† | −0.033em | 600 | hero + §03/§04/§05 openers |
| `h2` | 32 / 40 / **44** | 1.10 | −0.033em | 600 | §06 FAQ, sub-heads |
| `h3` | 24 / 28 / **32** | 1.15 | −0.02em | 600 | card titles |
| `lead` | 20 / 20 / **24** | 1.35 | −0.01em | 400 | intros, pull-quotes |
| `body` | 16 / 18 / **18** | 1.55 | 0 | 400 | paragraphs |
| `caption` | 14 / 14 / **14** | 1.50 | 0 | 400 | taglines, fine print |
| `caps` | 11 / 12 / **12** | 1.0 | **+0.28em** | 500 | metadata, eyebrows, §-labels (UPPERCASE) |
| `micro` | 10 / 10 / **10** | 1.4 | **+0.22em** | 500 | figure #s, axis values, element-box IDs (UPPERCASE) |

- Heading tracking is one em value (−0.033em = the hero's −1.87px @ 56). Caps family uses *positive* tracking — this carries catalog energy, not a second typeface.
- **† Locked hero stays 56 / 1.15 / −1.87px** (a looser display-leading variant; default for new display work is 1.10). Wordmark: SVG, 292px wide.

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
- **Gradient values sample from actual Material colours** so typography and product read as one system. Set **italic** (sans italic — Jakarta), via `background-clip: text`.
- **Locked gradients** (see Palette above / `design-system.md §4.3`): creative (purple→orange, hero/§02) · library (pink→amber→yellow, §03) · material shimmer (§04). One per section, never on an opener/metadata/caption.

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

**Always smoke-test UI changes yourself first.** Load the running dev server and scroll/exercise the section in the browser before claiming done. This first-pass sanity check is non-negotiable.

**Desktop / `visual-reviewer`: ON REQUEST ONLY.** Do NOT auto-run `visual-reviewer` after every task. Dan reviews desktop himself (he spots issues in seconds) and triggers it manually when a task warrants it or at a project checkpoint. Its real value here is *static composition + cross-component collisions* (e.g. a heading colliding with the fixed CTA pill), not scroll-driven motion timing — it can't hold a frame mid-scrub and falls back to re-reading code. Invoke it only when Dan asks or names a checkpoint.

**Mobile / `mobile-reviewer`: AUTOMATIC.** After ANY task that creates or reworks the mobile view (responsive layout/styling below `lg`, mobile-only variants, mobile motion), invoke the `mobile-reviewer` subagent before claiming done. It reviews mobile aesthetics + best practices at 375 (and 390), writes a report, and recommends fixes. Act on its clear findings; surface design judgments to Dan. **Mobile is the reviewer's gate; desktop is Dan's.**

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
- `design-system.md` — **source of truth** for type / spacing / colour / breakpoints + the element-box & grid-line primitive specs (locked Session 1)
