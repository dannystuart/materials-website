# §05 — Close (the pack chooser)

**Status:** design locked, ready for implementation plan.
**Date:** 2026-05-18.
**Branch (TBD):** `feat/section-05-close`.

The brief calls this §08. We're building it next in code (right after §04 Recipe), so it lives at `src/components/section-05/` for now. If §05–§07 (what changes / proof / doubts) get inserted later, this directory renames; if not, it stays. See *Open questions* at the bottom.

---

## Job

Close. Show what's in the box, make the choice obvious, end the page. Two cards side by side: paid Materials¹ ($9) and free Dark Materials (Free). The buyer should be able to read both at a glance and decide.

Dark Materials is **not** a sampler of Materials¹ — it's a disjoint set of 10 Materials with their own dark character. The cards are parallel volumes from the same shelf, not "lite vs full."

## Composition

### Desktop (1440 lead canvas)

```
   Two ways in.                                                ← headline, left-anchored
                                                                gradient-word on "in"


      ┌── PAID CARD ──────┐         ┌── FREE CARD ──────┐
      │  warm halo behind │         │  cool halo behind │     ← twin halos extend ~35%
      │                   │         │                   │       past card edges
      │  catalog header   │         │  catalog header   │
      │  Materials¹       │         │  Dark Materials   │
      │  $9               │         │  Free             │
      │  ~11-line list    │         │  ~4-line list     │
      │  [Get Materials¹] │         │  [Get Dark        │
      │                   │         │   Materials]      │
      └───────────────────┘         └───────────────────┘


                                       Have fun ✌️ — Danny    ← sign-off, right-anchored
```

- Editorial diagonal: headline left, sign-off right.
- Cards equal column width (~440px), gutter ~80px, equal-width **unequal-height**. Paid runs ~540px tall, free ~340px. The asymmetric content density is the argument — *don't* equalize heights.
- Section sits inside the same editorial margins as §01/§02 (`min-[1600px]:left-12vw` rhythm). Don't drift to dead-center.
- Vertical breathing: `py-32` above headline so the section recovers from §04's density. Headline → cards ~96px. Cards → sign-off ~64px.

### Mobile (375 secondary canvas)

Stack vertically with 24px gutters: headline → paid card → free card → sign-off. Halos scale down with cards. No horizontal scroll. Hover system replaced by tap-state on press (matches floating CTA's mobile pattern).

## Card anatomy

Four zones, same structure on both cards. Content density and palette diverge.

### 1. Catalog header

Caps + tight tracking, ~12px, `text-white/60`, flush left. The `·` separators echo §01's `© 2026 · Volume 01`.

- Paid: `MATERIALS¹ · EDITION 01 · 160 SPECIMENS`
- Free: `DARK MATERIALS · SERIES Dk · 10 SPECIMENS`

### 2. Pack name + tagline

Display semibold, ~32px. Tagline one quiet line below in `text-white/65`, designer-to-designer voice.

- Paid: **Materials¹** / *"The full library. 160 specimens."*
- Free: **Dark Materials** / *"Ten dark Materials. Free, no email."*

### 3. Price

Big numeral, semibold, ~44px, flat white on both. Tiny `paid once.` strapline under `$9` for honesty.

- Paid: `$9`
- Free: `Free`

Gradient-word accent lives on the headline, not the price.

### 4. What's included

Vertical emoji-prefixed list, Plus Jakarta Sans 14px, `text-white/85`.

Paid (full pack manifest from brief §08):
- 🌄 160 stills
- 🎥 160 video loops
- 👻 160 transparent PNGs
- ✨ 5× 4K hero loops
- 🦸‍♂️ 3× hero designs for web
- ✏️ 9× UI card templates
- 🎓 Mini guide: Materials in AI
- 🛠️ 3 prompts for making your own
- 📁 Figma file
- ⚡️ Lifetime updates
- 🙋‍♂️ Support

Free (best-guess — see Open questions):
- 🌄 10 stills
- 🎥 10 video loops
- 👻 10 transparent PNGs
- ⚡️ Free updates

### 5. CTA

Full-width pill at card bottom.

- Paid: `Get Materials¹ — $9` with iridescent edge sampling the warm halo palette.
- Free: `Get Dark Materials` with hairline cool-grey border, no iridescent edge.

## Visual systems

### Twin halos (resting)

Each card has its own concentric-arc field behind it — same WebGL shader family as §02's `PitchOrbits`, but reduced:
- 3 rings each (vs §02's 5).
- Centered on the card's geometric center.
- Outermost ring extends ~35% past card edges so the halo blooms beyond the corners.
- Marked `aria-hidden="true"`.

Palettes:
- **Paid halo:** amber → iridescent magenta. Warm bias on inner ring, iridescent shimmer on outer. Sampled to echo the hero's `creative` gradient family.
- **Free halo:** blue → violet — direct reuse of §02's `rgba(83,149,237,...)` and `rgba(168,85,247,...)`.

Resting intensity:
- Paid: ~0.6× §02's brightness (you can feel the warmth nearby).
- Free: ~0.3× (almost matte — quiet presence only).

Pulse cycle:
- Each halo runs a §02-style ring-by-ring pulse, ~10s cycle (slower than §02's 7s).
- Paid offset by half-cycle from free so they never pulse in sync.

### Card hover (§02 system inherited, palette swapped)

Both cards inherit §02's `PitchOutputFigure` hover system wholesale:
- Cursor-tracking lit edge (radial gradient masked to a 1px border).
- Behind-card cursor-tracking bloom.
- Card scale 1.055×.
- Text colour bloom (label `white/85` → `white`, caption `white/65` → `white/90`).
- 1100ms `cubic-bezier(0.16, 1, 0.3, 1)` easing.

Palette swaps per variant:
- Paid: lit edge + bloom in warm/iridescent (matches halo).
- Free: lit edge + bloom in blue/violet (matches §02 exactly).

The underlying halo brightens ~1.5× on hover in support, decaying back to resting intensity over 600ms when cursor leaves. Local light and atmospheric field move together, not in conflict.

### Gradient-word accent

Headline: *"Two ways in."* — gradient lands on **"in"**.

Gradient stops mix warm + cool (`#A855F7 → #F97316`, same hero family) so the headline doesn't bias toward the paid card. This is the section's only ornament. Bookends the page with §01's `creative`.

### Reduced motion

- Halos fall back to static low-intensity radial gradients. No rotation, no pulse.
- Card hover drops scale and cursor tracking, keeps colour bloom on label/caption.
- `useReducedMotion` already wired (`src/components/hero/useReducedMotion.ts`).

## Implementation shape

### Files

```
src/components/section-05/
  SectionClose.tsx          — orchestrator, handles responsive switch
  SectionCloseDesktop.tsx   — 1440 layout (headline / cards / sign-off)
  SectionCloseMobile.tsx    — 375 stack
  PackCard.tsx              — single card; takes variant: "paid" | "free"
  PackHalo.tsx              — concentric-arc field (WebGL, 3 rings, palette prop)
  packData.ts               — copy + inventory + palette for both packs
```

### Reuse strategy (§02 ↔ §05)

Two paths considered:
- **(a)** Copy-and-adapt §02's `PitchOutputFigure` + `PitchOrbits` for §05. Some duplication.
- **(b)** Extract card hover and orbits shader to `src/components/primitives/` (`HoveringCard.tsx`, `OrbitsField.tsx`) — both sections consume them.

**Chosen: (a) for now.** CLAUDE.md's rule — "primitives get promoted on third recurrence (two = coincidence, three = system)." Wait for §06+ before promoting. Flag for revisit when a third instance lands.

### Dependencies

Nothing new. Three.js, GSAP, `useReducedMotion` all wired.

### Motion budget

Brief's two motion-heavy moments are §02 (fan-out + lit connectors) and likely §03 or §04. This section adds halo pulse cycles (atmospheric, ambient) + card hover (local, on-demand). Neither qualifies as a "motion-heavy moment." No scroll-driven reveal here.

### Floating CTA integration

When the section enters viewport (IntersectionObserver, ~30% threshold), the floating CTA fades out — the inline paid CTA replaces it. When the section leaves upward, the floating CTA fades back in. Simple swap, no state machine.

### Accessibility

- Halos `aria-hidden="true"`.
- Both cards keyboard-reachable via the inline CTA button. No nested interactive regions; cards are not wrapped in `<a>`.
- Tab order: headline (non-focusable) → paid CTA → free CTA → sign-off (non-focusable).
- Catalog headers are plain text (readable, not decorative-hidden).
- `prefers-reduced-motion` handled as above.

### Verification

Per CLAUDE.md:
- Smoke-test in browser at 1440 + 375 before delegating to visual-reviewer.
- Visual-reviewer loop until PASS at both viewports.
- No ScrollTrigger planned here — but if one is added later, wrap with `deferGsap` from `@/lib/scrollTrigger`.

## Open questions (need resolution before implementation)

1. **Free pack inventory.** Best-guess list above (10 stills / 10 loops / 10 PNGs / Free updates). Confirm against the actual Gumroad listing for Dark Materials.
2. **Section numbering.** Code lives at `section-05/` because it's next in build order. If §05–§07 (what changes / proof / doubts) will be inserted later, plan to rename this directory at that point. If they're being skipped, `section-05/` is permanent. Worth deciding before too many imports reference it.
3. **Paid halo gradient stops.** Locked in concept (warm → iridescent magenta) but exact stops will be tuned against the live halo render — likely 2–3 small palette iterations during implementation.
