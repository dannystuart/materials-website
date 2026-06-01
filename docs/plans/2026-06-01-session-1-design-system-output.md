# Session 1 — Design-system foundation — output note

**Date:** 2026-06-01
**Branch:** `feat/design-system-foundation` (not committed — Dan controls commits via `/gitme`)
**Status:** Done. Scope was tokens + artifact only; **no section migration** (that's Session 2).

## What shipped

1. **`design-system.md`** at repo root — the new source of truth. Type scale (9 levels, per-format), spacing scale, closed colour/gradient palette, breakpoint strategy with a real tablet tier, and the element-box + technical-grid-line primitive specs. Includes a provenance table of the pre-Session-1 drift.
2. **`src/app/globals.css`** — tokens encoded (additive only; existing hero/gradient classes untouched, zero visual change):
   - `@theme` — `--color-plate-*` palette + `--breakpoint-wide` (1600) / `--breakpoint-ultra` (2200).
   - `:root` — per-format type sizes (`--fs-*`, redefined in `@media` at 768/1024), `--gradient-*`, `--atmosphere-blue-*`.
   - `@layer components` — `.t-mega … .t-micro` responsive type classes (the anti-drift mechanism: one class, correct at every format).
3. **`CLAUDE.md`** — the "to be locked" type-scale + gradient placeholders are filled; palette section expanded (ink ladder, atmosphere blue, Material gradients + seeds, plate); file-map line for `design-system.md` updated; design-tokens section now points at `design-system.md` as source of truth.
4. **Master plan** — Session 1 marked DONE; punch-list rows 1 and 3 updated.

## Decisions taken with Dan (the judgment calls)

- **Scale philosophy: curated 4px grid, *not* a strict modular scale.** Larger sizes are strict ÷4 even numbers; the small end fine-tunes (caps 11/12, body 18, micro 10). Rationale: keeps Session 2 a *consolidation* (snap drift away) rather than a redesign (a foreign 1.25/1.2 grid would have moved card/lead sizes and forced visual changes).
- **Keep a `mega` size** = 72 (§02 pitch only; it's already grid-aligned, no need to drop to 64).
- **`display` = 56** — ratifies the locked hero; snaps §03/§04's 60→56.
- **Mobile display = 40** (over 36) — clean 8px separation above mobile h2 (32); matches §02/§05's existing bigger mobile sizes.
- **Tablet = real discrete `md:` tier** (over fluid clamp / inherit-desktop) — explicit ÷4 values per role, gives Session 3 concrete targets; avoids clamp fighting the existing vw gutters.
- **Tracking reconciled to one em value** (−0.033em on the heading family = the hero's −1.87px @ 56). The old −1.87 / −2.2 / −2.6px spread was ≈ constant in `em` already.

## Verified (smoke test)

Fresh `pnpm dev`, injected each `.t-*` class, read computed styles at 375 / 820 / 1440:

| | mobile 375 | tablet 820 | desktop 1440 |
|---|---|---|---|
| mega / display / h2 / h3 | 44/40/32/24 | 60/48/40/28 | 72/56/44/32 |
| lead / body / caption | 20/16/14 | 20/18/14 | 24/18/14 |
| caps / micro | 11/10 | 12/10 | 12/10 |

Leading, tracking, weight, uppercase, and Plus Jakarta Sans all resolve correctly; all colour/gradient/atmosphere CSS vars register. 0 console errors (2 pre-existing `THREE.Clock` deprecation warnings, unrelated).

## Open items handed to later sessions

- **§4.2 atmosphere-blue opacity** (hero 0.3 vs footer 0.18) — documented as deliberate "stronger at open, softer at close"; confirm/flatten in Session 2.
- **Brief vs code:** creative gradient is purple→**orange** in code (brief says purple→pink). Code is canonical; flagged in both docs.
- **Session 2:** migrate §02–§05 (+ FAQ/footer) off inline `style={{}}` and rogue arbitrary values onto `.t-*` classes + the `wide:`/`ultra:` breakpoints; reconcile the FAQ's `sm:` usage onto the `md:` tablet convention. Hero (§01) stays locked.
- **Session 3:** implement the tablet layer (the `md:` *values* exist; the *layouts* don't yet).
