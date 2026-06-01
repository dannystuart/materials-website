# Materials¹ — Design System

**Status:** v1, locked 2026-06-01 (Session 1 of the design-system + skills plan).
**Scope of this doc:** the single source of truth for type, spacing, colour, breakpoints, and the two visual primitives (element box · technical grid line). It supersedes the per-section, re-invented values that existed before.

This file fills the "to be locked" placeholders in `CLAUDE.md`. Where the two disagree, **this file wins** and `CLAUDE.md` should be updated to match.

> **How the system was derived.** Every value here was reconciled from the *actual* coded values across §01–§06 + footer (not guessed). The headings had drifted (56 / 60 / 72 doing the same job; leading/tracking expressed inconsistently); the support tiers (body 18, lead/quote 26, caps 11, micro 10) were already stable. The reconciliation rule Dan set: **snap to a 4px grid with even numbers for the larger sizes; only let the small end fine-tune to odd values (11/13) where 4px steps are too coarse.** Keep one *mega* size for the §02 moment.

---

## 1. Foundations

- **Typeface:** Plus Jakarta Sans — the only typeface. Weights **400 / 500 / 600 / 700**. No mono, even for metadata. CSS var `--font-display` (`var(--font-jakarta)`), Tailwind class `font-display`. Catalog feel comes from **weight differential + caps/tracking on metadata + layout**, never typeface contrast.
- **Grid:** all sizing snaps to a **4px base grid**. Larger type and all spacing are strict multiples of 4; the small end of the type scale (caps/micro/body) may fine-tune off-grid for legibility.
- **Heat discipline:** the page chrome is cool/dark. **Materials are the only warm source.** The only page-level atmosphere is the bottom-edge atmosphere-blue (§4).

---

## 2. Type scale

Nine named levels. Each has a value **per format** (mobile base → tablet `md:` ≥768 → desktop `lg:` ≥1024). Leading, tracking and weight are constant per role across formats unless noted — **only the size steps**.

### 2.1 The scale (sizes in px)

| Token | role / used by | mobile | tablet | **desktop** | leading | tracking | weight |
|---|---|---:|---:|---:|---|---|---|
| `mega` | §02 pitch — the one big moment | 44 | 60 | **72** | 1.05 | −0.033em | 600 |
| `display` | hero + §03/§04/§05 section openers | 40 | 48 | **56** | 1.10 † | −0.033em | 600 |
| `h2` | §06 FAQ + sub-section heads | 32 | 40 | **44** | 1.10 | −0.033em | 600 |
| `h3` | card titles (PackCard, plates) | 24 | 28 | **32** | 1.15 | −0.02em | 600 |
| `lead` | section intros, pull-quotes/testimonials | 20 | 20 | **24** | 1.35 | −0.01em | 400 |
| `body` | paragraphs, FAQ answers | 16 | 18 | **18** | 1.55 | 0 | 400 |
| `caption` | taglines, fine print, FAQ descriptions | 14 | 14 | **14** | 1.50 | 0 | 400 |
| `caps` | metadata, eyebrows, §-labels | 11 | 12 | **12** | 1.0 | **+0.28em** | 500 |
| `micro` | figure numbers, axis values, element-box IDs | 10 | 10 | **10** | 1.4 | **+0.22em** | 500 |

All ÷4 except the deliberately fine-tuned small end: `body` (18/16), `caption` (14), `caps` (11 mobile), `micro` (10).

**Two tracking conventions, not one:**
- **Heading family** (`mega`/`display`/`h2`): a single em value **−0.033em** (this equals the locked hero's −1.87px @ 56). Reconciles the old −1.87 / −2.2 / −2.6px spread, which was ≈ −0.030 to −0.037em — i.e. nearly constant in `em` already. `h3`/`lead` ease toward 0.
- **Caps family** (`caps`/`micro`): **positive** tracking (+0.28em / +0.22em), uppercase. This is what carries the "scientific catalog" energy — *not* a second typeface.

**† Display leading & the locked hero.** Token default is **1.10**. The hero (`56 / 1.15 / −1.87px`) is **locked** and stays at 1.15 — a looser page-headline measure — and §05's short centred line also runs 1.15; dense multi-line openers (§03/§04) may run 1.08. Treat 1.08–1.15 as the allowed display-leading band; default to 1.10 for new work.

### 2.2 Caps & uppercase metadata — usage

`caps`/`micro` are always `text-transform: uppercase`, weight 500, positive tracking. They are the catalog's instrumentation voice: §-labels ("§02 / The pitch"), figure numbers ("01 / 02 / 03"), ratings, attributions, element-box designations, axis values. **Never** set headlines or reading copy in caps. Colour them down the ink ladder (`white/45`–`white/55`), not full white.

### 2.3 What is *not* on the scale

- **Plate wordmark** ("Materials¹" on the library plate) is a **700** weight specimen at 26px — a one-off brand lockup, not a scale level. Leave as-is.
- The gradient-word accent (§4.3) is a *treatment* applied to a single word at `display`/`lead`/`mega` size — not its own level.

---

## 3. Spacing

### 3.1 Base ramp (the only allowed values)

Spacing is a strict 4px grid. Stay on this ramp; no rogue values (Tailwind's default spacing already maps 1 unit = 4px, so these are native utilities).

```
4   8   12   16   24   32   40   48   64   80   96   128   160
(1) (2) (3)  (4)  (6)  (8)  (10) (12) (16) (20) (24) (32)  (40)   ← Tailwind units
```

### 3.2 Semantic spacing tokens

| Token | mobile | tablet | desktop | wide ≥1600 | ultra ≥2200 |
|---|---|---|---|---|---|
| `gutter` (page horizontal padding) | 24 `px-6` | 32 `px-8` | 48 `px-12` | `12vw` | `20vw` |
| `section-pt` (top padding, generous) | 80 | 96 | 128 | — | — |
| `section-pb` (bottom padding, generous) | 96 | 128 | 160 | — | — |
| `section-pt/pb` (compact, e.g. FAQ) | 48 / 40 | 80 / 64 | 96 / 64 | — | — |

**Tablet gutter is new** — today the site has almost no `md:`; the 32px gutter at `md:` is the intended intermediate between mobile 24 and desktop 48. Implemented in Session 3.

### 3.3 Stack gaps (between elements)

Pull from the ramp; common roles:

- eyebrow → headline: **24** (desktop) / 16 (mobile)
- headline → lead: **32** / 24
- between content blocks within a section: **48–80**
- inside a card (title → body → meta): **12–16**
- between sibling cards/columns: **48–80** (`gap-12`–`gap-20`)

---

## 4. Colour & gradient tokens

The palette is **closed** — do not extend it or add a second hue family without sign-off.

### 4.1 Chrome (cool / dark)

| Token | Value | Use |
|---|---|---|
| `--color-hero-bg` | `#010100` | page background (near-pure black) |
| ink / primary | `#FFFFFF` | primary text |
| ink / secondary | `white 70%` | body/secondary text |
| ink / tertiary | `white 55%` | de-emphasised meta, captions |
| ink / muted | `white 45%` | eyebrows, §-labels |
| ink / faint | `white 35%` | very faint dividers |
| hairline | `white 8%` (`rgba(255,255,255,0.08)`) | borders, technical grid lines |

The ink ladder is just opacity on white — use Tailwind's `text-white/70` etc. No separate tokens needed; the named steps above are the **only** rungs to use (don't invent `white/62`).

### 4.2 Atmosphere blue (the *only* page-level atmosphere)

A bottom-anchored radial wash; cool, never warm. Two layered ellipses at `50% 100%`, the lighter one in `mix-blend-mode: plus-lighter`.

| Token | RGB | Notes |
|---|---|---|
| `--atmosphere-blue-deep` | `rgb(44,94,160)` | deeper layer |
| `--atmosphere-blue-light` | `rgb(83,149,237)` | lighter layer (plus-lighter) |
| `--atmosphere-blue-close` | `rgb(96,142,224)` | §05 card-cluster ambient variant |

⚠ **Opacity drift to reconcile in Session 2:** the hero bottom-edge wash uses these at **0.3** (per the original §01 spec in CLAUDE.md); the footer uses **0.18**. Pick one canonical pair of alphas (recommend hero 0.30 / footer 0.18 stays as a deliberate "stronger at the open, softer at the close" gradient of intensity — document the intent rather than flatten).

### 4.3 Material gradients (the *only* warm source)

Warmth lives exclusively in the Materials and the type ornament that samples them. Three gradients in use:

| Token | Value | Use |
|---|---|---|
| `--gradient-creative` | `linear-gradient(90deg, #A855F7 0%, #F97316 100%)` | hero "creative" word; CTA pill border (@0.5); ripple base |
| `--gradient-library` | `linear-gradient(90deg, #F472B6 0%, #FB923C 50%, #FACC15 100%)` | §03 "160" |
| `--gradient-material` | `linear-gradient(100deg, #A855F7, #F472B6, #F97316, #F472B6, #A855F7)` | §04 animated "Material" shimmer |

⚠ **Brief vs code:** the brief calls the creative gradient "purple-to-pink"; the **code is purple-to-orange** (`#A855F7 → #F97316`). The code value is canonical here — flag before "correcting."

**Material colour seeds** (the actual Material colours the gradient-word treatment samples from):

`violet #A855F7` · `pink #F472B6` · `orange #F97316` · `amber #FB923C` · `yellow #FACC15`

### 4.4 Gradient-word accent — the type system's only ornament

- A single word, rendered in a Material gradient (`background-clip: text`), set **italic** (sans italic — Jakarta), one word **per section, maximum**.
- **Never** on a section opener, metadata, or caption. Only on `display`/`lead`/`mega` copy where one word carries emphasis. (§02 already does this correctly on "Material".)
- Gradient values **sample from real Material colours** (§4.3) so type and product read as one system.

### 4.5 Plate (the library card's inverted light surface)

The one place the page goes light — the periodic-table plate.

| Token | Value | Use |
|---|---|---|
| `--color-plate-bg` | `#F4F4F6` | plate surface |
| `--color-plate-ink` | `#0B0B0E` | text on plate |
| `--color-plate-label` | `#5B5BD6` | plate metadata labels (violet) |

### 4.6 CTA accents

Button accents come from the Materials' own palette — **no neon-lime, ever**.

- border: `--gradient-creative` @ opacity 0.5
- ripple: `radial-gradient(circle, rgba(168,85,247,0.35), rgba(249,115,22,0.20) 30%, transparent 70%)` (`#A855F7` = `rgb(168,85,247)` — same violet as the creative gradient)
- focus ring: `rgba(168,85,247,0.8)`

---

## 5. Breakpoint strategy

Today the site jumps **mobile-base → `lg:`** with almost no `md:`. The system defines a **real tablet tier**. (This section defines the strategy + tokens; the *layouts* land in Session 3.)

| Tier | Range | Tailwind | Role |
|---|---|---|---|
| **mobile** | < 768px | base (no prefix) | phones; 24px gutters |
| **tablet** | 768–1023px | `md:` | **new deliberate tier** — 32px gutters, tablet type step |
| **desktop** | ≥ 1024px | `lg:` | **primary canvas (design at 1440)** |
| **wide** | ≥ 1600px | `wide:` | vw-based gutters engage (`12vw`) |
| **ultra** | ≥ 2200px | `ultra:` | max vw gutters (`20vw`) |

- `wide`/`ultra` are added as named Tailwind v4 breakpoints (`--breakpoint-wide`, `--breakpoint-ultra`) to replace the ad-hoc `min-[1600px]` / `min-[2200px]` arbitrary variants.
- **Migration note (Session 2/3):** the FAQ's existing `sm:` usage should move onto the `md:` tablet convention.
- Desktop-led rule stands: build 1440 first, adapt tablet + mobile in the same pass.

---

## 6. Visual primitives (paired — periodic-table identity)

Element boxes and technical grid lines are a **coupled system**: the box says *"this Material has a designation"*; the grid line says *"this is the reference field that designation lives in."* Either alone reads weaker than both. **Not yet built in code** — these are the specs to build against (§02's existing pitch-diagram SVG is the first candidate to align to this in Session 2). Don't apply everywhere or they flatten into decoration: **three sizes / three contexts, max.**

### 6.1 Element box

An invented, **site-only** per-Material designation. Must **never** appear inside the downloaded product (file names, Figma file, Gumroad listing).

**Anatomy:** `NNN / Sy / category` — zero-padded 3-digit ID · capitalised 2-letter symbol · lowercase category name. E.g. `014 / Mt / matte` · `027 / Gl / gloss` · `051 / Cr / chrome`.

**Category vocabulary (fixed):**

`Mt` matte · `Gl` gloss · `Cr` chrome · `Fl` fluid · `Or` organic · `Vb` vibrant · `Ds` dust/textured · `Ic` iridescent

**Three sizes / contexts:**

| Size | Type | Context |
|---|---|---|
| `tag` | ID + symbol only, `micro` (10/+0.22em) | inline beside a label or sitting on a hairline |
| `plate` | full designation; symbol in `caps` (12), ID/category in `micro` | boxed in a hairline border, on a grid intersection |
| `figure` | ID prominent at `h3`/`lead`, symbol `caps`, category `micro` | the labelled "specimen" hero of a diagram |

**Rules:**
- Plus Jakarta Sans, uppercase symbol, tight/positive tracking per the caps tokens. No mono.
- Colour: ink ladder (`white/55`–`white/70`) or atmosphere-blue — **never warm** (warmth is the Material's).
- Must sit **on a grid line / tick / hairline** — never float.
- Decorative (non-informative) instances are `aria-hidden="true"`.

### 6.2 Technical grid lines

Hairline instrumentation that reads like a periodic-table reference plate — *scientific catalog, not blueprint*.

- **Stroke:** ≤ 1px, the `hairline` token (`white 8%`) or atmosphere-blue at low alpha. Low contrast.
- **Motif vocabulary:** concentric arcs · fine dot grids · ruled grids · occasional radial fans · light tick marks. Associated labels (axis values, figure numbers, coordinates) in `caps`/`micro`.
- **Behaviour:** never carries the eye — **texture, not content.** Low opacity, sits behind/around content.
- **Pairing:** deploy with element boxes; a box should land on a grid line/tick.

---

## 7. Token encoding (where this lives in code)

Encoded in `src/app/globals.css` this session (no section migration — Session 2 applies them):

- **`@theme`** — palette colours (`--color-hero-bg`, `--color-plate-*`) and the new `--breakpoint-wide` / `--breakpoint-ultra`.
- **`:root` custom properties** — per-format type values (`--fs-*` redefined inside `@media` at 768/1024), the gradient values (`--gradient-*`), atmosphere-blue seeds (`--atmosphere-blue-*`).
- **`@layer components`** — responsive type classes **`.t-mega .t-display .t-h2 .t-h3 .t-lead .t-body .t-caption .t-caps .t-micro`**. Each bakes in size (responsive via the `--fs-*` vars), leading, tracking, weight, and (for caps/micro) uppercase. **This is the anti-drift mechanism**: a section writes `className="t-display"` once and is correct at all three formats. Prefer these classes over arbitrary values or inline styles.

> **Turbopack note:** a long-running dev server may not recompile `globals.css` when new selectors are added. If `.t-*` classes don't apply, restart `pnpm dev`.

---

## 8. Provenance (the drift this reconciled)

Real coded values before Session 1, for the record:

| Section | display size | leading | tracking | set via |
|---|---:|---|---|---|
| Hero §01 (locked) | 56 | 1.15 | −1.87px (−0.0334em) | inline |
| §02 Pitch | 72 | 1.05 | −2.6px | inline |
| §03 Library | 60 | 1.08 | −2.2px | inline |
| §04 Recipe | 60 | 1.08 | −2.2px | inline |
| §05 Close | 56 | 1.15 | −1.87px (−0.0334em) | Tailwind |
| §06 FAQ | 44 | 1.08 | −1.3px | inline |

Resolution: `display` = **56** (snap §03/§04 60→56, ratify locked hero); `mega` = **72** (kept, grid-aligned, §02 only); `h2` = **44** (FAQ); tracking unified to **−0.033em** in em. Support tiers (body 18, lead/quote 26→24, caps 11→12, micro 10) were already near-stable and snapped to grid.
