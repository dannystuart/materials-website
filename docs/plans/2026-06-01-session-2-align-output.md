# Session 2 — Align the site to the design system — output note

**Date:** 2026-06-01
**Branch:** `feat/design-system-foundation` (not committed — Dan controls commits via `/gitme`)
**Status:** Done. Type/breakpoint migration of §02–§06 + footer onto the locked `.t-*` system. Consolidation, **not** redesign — no palette/typeface/motion/layout changes.

## What shipped

Migrated **18 component files** off re-invented type (inline `style={{fontSize…}}` and arbitrary `text-[]`/`leading-[]`/`tracking-[]`) onto the Session-1 `.t-*` responsive classes. One class per element is now correct at all three formats.

**Role mapping applied** (per `design-system.md §2`):

| Role | Class | Where |
|---|---|---|
| §02 pitch opener | `t-mega` | SectionPitch{Desktop,Mobile} |
| §03/§04/§05 openers + §05 MacBook caption | `t-display` | SectionLibrary/Recipe/Close, MacbookDemo |
| §06 FAQ heading | `t-h2` | SectionFaq{Desktop,Mobile} |
| Pack-card title | `t-h3` | PackCard |
| Section intro lines, testimonial quotes, FAQ questions | `t-lead` | §03 sub-line, Library/Close testimonials, FaqItem (+`font-medium`) |
| §02/§04 ledes, FAQ answers | `t-body` | SectionPitch/Recipe ledes, FaqItem answer |
| Pack-card tagline, FAQ description | `t-caption` | PackCard, SectionFaq description |
| Eyebrows, §-labels, attributions, rating labels, tile labels, footer copyright | `t-caps` | every section eyebrow, testimonials, RecipeTile, PackCard catalog header, Footer{Desktop,Mobile} |
| FAQ item numbers | `t-micro` | FaqItem |

**Breakpoint migration:** ad-hoc `min-[1600px]`/`min-[2200px]` → the new `wide:`/`ultra:` Tailwind v4 variants (§05 Close, §06 FAQ). The FAQ's `sm:` usage → the `md:` tablet convention (FaqItem grid/gaps/spacers). Hero §01 kept its `min-[…]` (locked — out of scope).

## Verified

Fresh `pnpm dev` (Turbopack), computed styles read at **375 / 768 / 1440**:

| token | 375 | 768 | 1440 | spec (mobile/tablet/desktop) |
|---|---|---|---|---|
| mega | 44 | 60 | 72 | 44/60/72 ✓ |
| display | 40 | 48 | 56 | 40/48/56 ✓ |
| h2 | 32 | 40 | 44 | 32/40/44 ✓ |
| h3 | 24 | 28 | 32 | 24/28/32 ✓ |
| lead | 20 | 20 | 24 | 20/20/24 ✓ |
| body | 16 | 18 | 18 | 16/18/18 ✓ |
| caption | 14 | 14 | 14 | 14 ✓ |
| caps | 11 | 12 | 12 | 11/12/12 ✓ |
| micro | 10 | 10 | 10 | 10 ✓ (only use = FAQ number, hidden `< md`) |

Leading / tracking / weight / uppercase all resolve to the locked values (e.g. display = 1.10 lh, −0.033em; caps = 0.28em). **Hierarchy descends cleanly** mega→micro at every width. **`overflowX: none`** at all three widths. `tsc --noEmit` clean · `pnpm lint` clean (1 pre-existing unrelated warning) · **20/20 tests pass**.

## Judgment calls (the non-mechanical decisions)

- **§02/§04 "lede" → `t-body`, not `t-lead`.** Despite the `data-reveal="lede"` name, these paragraphs were styled `18px/1.55` = the *body* spec. Mapping by actual role (not variable name) keeps desktop pixel-identical (18px) and matches the brief's "only desktop delta = lead 26→24". The genuine *lead*-sized intros are §03's sub-line and the testimonial quotes.
- **Lead/quote 26 → 24 on desktop** (the one intended desktop delta) and **26 → 20 on mobile** (testimonials were non-responsive at 26 flat; 20 is the correct mobile lead tier — an over-size fix, not a regression).
- **Display leading reconciled to 1.10.** §03/§04 ran 1.08, §05 ran 1.15; all now resolve to the `t-display` default 1.10 (inside the documented 1.08–1.15 band). §05's openers are single lines so the change is imperceptible; §03/§04 dense openers gain ~1px line-gap. Eliminates all arbitrary `leading-[]`.
- **Caps tracking unified to 0.28em.** Section eyebrows were a mix of 0.28/0.26em; testimonial attributions + pack catalog header were 0.22/0.14em. All now use the single caps token (0.28em). This is the "scientific catalog" voice the system mandates — but it visibly loosens the pack catalog header and widened the §05 attribution past the 375 fit line (see Regression below).
- **FAQ question → `t-lead` + `font-medium`.** The scale has no dedicated "list-item question" tier; the 20px question maps to the lead tier with its medium weight preserved (desktop 22→24, a minor bump).
- **`font-normal` for the §04 third headline line.** "That's the whole recipe." stays display-sized (inherits the h2's `t-display`) at weight 400 — replaces an inline `fontWeight:400`.

## Logged exceptions (deliberately left off the scale)

These are UI controls, iconographic glyphs, fitted kinetic text, or realistic mockups — not editorial type. Forcing them onto the 9-level scale would distort them. Each retains its bespoke value:

| Element | Value kept | Why |
|---|---|---|
| **LibraryPlate** (wordmark 26/700, variant title 20/600, metadata dl 10.5) | inline | Realistic Figma-file mockup; `design-system.md §2.3` explicitly exempts the plate wordmark — extended to the whole mini-mockup to preserve realism. |
| **RecipeOperator** (×/= glyphs, 72/44 @ 700) | inline | Decorative math-operator glyphs, `aria-hidden`; sized to the equation layout. |
| **RecipeInputType** (typewriter, 52/36) | inline | Kinetic demo text fitted to the tile width — part of §04's motion moment. |
| **PitchOutputFigure** (label 20, caption 13) | `text-[]` | Figure labels inside a fixed-geometry (1344×680) diagram; scale tokens would break the composition. (§02 pitch-diagram primitive alignment is a later, coupled task.) |
| **LibraryPlateStack chip** (11.5/0.22em) | `text-[]` | Interactive filter-button control (`Stills/Loops/Templates`). |
| **PackCard** price (44), price-strap (12), inventory list (14), CTA buttons (16), rating pill (12) | `text-[]` | Numeric figure + layout-coupled dense card content + UI controls; migrating leading would alter card height. (Title/catalog-header/tagline **were** migrated.) |
| **FooterPill** (13/14) | `text-[]` | Interactive nav-pill control (already on `md:`). |

> Plate **colour** arbitrary values (`text-[#0B0B0E]` etc.) are out of scope this session ("migrate type, leave colours") — they can move onto `text-plate-ink` / `bg-plate-bg` / `text-plate-label` in a later colour pass.

## Regression found + fixed

The caps-token unification (attribution 0.22em → 0.28em) pushed §05 `CloseTestimonial`'s centred attribution past the 375 fit line — "Eric Kerr" / "Verified Buyer" wrapped mid-name. **Fixed**: hid the two decorative flanking dashes `< md` (`hidden md:block`) and added `whitespace-nowrap` to the names. Re-verified at 375: single line (11px height), dashes return at `md:`+, no overflow. (§03's left-aligned testimonial has one dash and already fit — left alone.)

## Mobile-reviewer (the gate) — triage

Ran `mobile-reviewer` at 375/390. Findings sorted by ownership:

- **Fixed (caused by this session):** §05 attribution wrap → done (above).
- **Deferred to Session 3 (pre-existing, out of type-scope; S3 owns "tap targets ≥44px"):**
  - §03 variant chips render ~35px tall (`LibraryPlateStack` `py-2`). Proper fix (`min-h-[44px]`) changes desktop chip height too → mechanical S3 work.
  - Footer pill `<a>` links have no hit-area height (~20px); fix touches the desktop pill. → S3.
- **Surfaced to Dan (design judgments — wrap aesthetics from the *intended* mobile size bumps, no overflow/clipping):**
  1. **§05 pack catalog header** "MATERIALS¹ · EDITION 01 · 160 SPECIMENS" wraps with the looser 0.28em caps tracking (splits "160 / SPECIMENS"). Options: shorten copy ("EDITION 01 · 160 SPECIMENS" — the card already says "Materials¹"), force a logical break, or accept.
  2. **§04** "That's the whole / recipe." — "recipe." orphans at the new 40px. Copy tweak ("That's the recipe.") or accept the light-weight coda.
  3. **§03** "Yours to apply across everything / you make." — `text-balance` on that sub-line would rebalance to a nicer split.

## Open items handed to later sessions

- **Session 3 (mobile/tablet refinement):** the two deferred tap-target fixes; the §05 MacBook video legibility item (#5); real tablet *layouts* (the `md:` type values now exist, the layouts don't); reduced-motion audit.
- **For Dan:** the three wrap-aesthetic judgments above (all cheap, all optional).
- **Later colour pass:** plate `#hex` arbitrary values → plate tokens.
- Untouched: hero §01 (locked), gradient-word accents, §05 centering, all colours, all motion.
