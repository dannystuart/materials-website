# Brief — Build the "design-analytical mind" into the system

**Date:** 2026-06-02
**Origin:** Session 3 (tablet + mobile refinement). Mid-session, Claude did an ad-hoc "design-eye" analysis of the hero headline on mobile that Dan agreed with — then said:

> "I could have directed this BUT I want my skills and mobile review and design system to do this for me automatically. **So build this design-analytical mind into our system.**"

**This brief is the handoff** for a fresh session that does exactly that. It captures (a) the worked example that proves the gap, (b) the reusable *method* to encode, (c) where it lives, and (d) the in-flight S3 decisions so they aren't lost.

---

## 1. The goal in one sentence

The reviewers and design system currently catch what is **broken** (overflow, <44px taps, clipped text). They do **not** reason about what is merely **not-designed** — type that technically fits but has lost its authored composition, a layout that fits but buries its own payoff, an element that doesn't overflow but is doing the wrong job at that size. **Encode that higher layer of design judgment so it runs automatically**, every review, on every project — not ad hoc in chat.

## 2. The worked example that exposed the gap (the proof)

**The hero headline at 375px.** Mechanical checks "passed" — no overflow, text legible, gutters fine — so S2 logged it as a minor "mobile-56 non-scaling" note and moved on. But a design eye sees three real failures the checklist never asks about:

1. **The composition collapsed.** `headlineLines.ts` authors four deliberate lines. At 56px in a 327px phone column every line wraps *again*, fracturing four lines into an eight-line ragged word-ladder ("for" alone, "Visual"/"ingredients" split). It doesn't read as *bold* — it reads as *unfitted*. (Controlled rag is a device; accidental rag is a defect. The reviewer must tell them apart.)
2. **The payoff fell below the fold.** The headline's entire hook is the gradient "*creative*" word — the page's signature ornament and brand thesis. At 56px it's stranded on line 7, under the video *and* the floating CTA. On load a phone user sees a wall of white words and never reaches the one coloured, meaningful one. At 40px the whole headline is ~6 lines and "*creative* explorers." has a real chance of landing in the first viewport.
3. **It silently broke the system.** Every other section opener renders at 40px (display tier) on mobile after S2. The hero at 56 is the *only* opener 40% out of step — and it's the first thing seen, so it sets the wrong rhythm for everything below. The deviation was **accidental, not earned**.

The method that produced this verdict mattered as much as the verdict: **render the real type at the real column width, compare 56 / 44 / 40 side-by-side on actual pixels, trace the cause (fixed px + a wide-canvas line composition), and prescribe a reframe (smaller size + authored mobile breaks + a scaled SVG) — not a shrink.** Screenshots from that pass were transient and have been cleaned up; reproduce by rendering the headline at 327px width if needed.

## 3. The lens to encode — "designed, not just not-broken"

Five stack-agnostic heuristics (Layer-1 *method* — true on any stack). A reviewer applies these **after** the mechanical checklist passes, to catch the design-judgment layer:

1. **Composition integrity.** Did responsive reflow preserve the *authored* composition, or collapse it into accident? (intended line-count vs wrap explosion; controlled vs accidental rag; alignment/rhythm survival). Ask: *"does this still look designed at this size, or merely not-broken?"*
2. **Payoff in view.** Is the element's *most meaningful part* — the hook, the CTA, the legible content, the gradient word — visible where it counts (first viewport / reading order), or buried by reflow? Mechanical checks pass while the *point* is lost.
3. **System fidelity & earned exceptions.** Does it obey the project's own tokens/tiers? If it deviates, is the deviation **deliberate and earned**, or an **unconsidered outlier**? (Only accidental outliers are defects.)
4. **Semantic fit, not spatial fit.** Is the element doing its *job* at this size (legible, usable, communicating), or merely fitting without overflow? When it fits but fails its job, the fix is **reframe, don't shrink** (e.g. the §05 MacBook: a phone-portrait crop *into the screen*, not a smaller 2:1 frame).
5. **Intent vs accident.** Before flagging any oddity, classify it: deliberate device or unconsidered artifact? Surface design *judgments* to the human; only fix accidents.

**The method (how to reach these calls, not just assert them):**
- Render at **real widths** and judge **real pixels** (375 column = ~327px after gutters), not the code in the abstract.
- **Trace the cause**, don't just name the symptom ("wraps" → *why*: fixed px + wide-canvas composition).
- When it's a genuine design call, **render the alternatives side-by-side** and decide on pixels (56 vs 44 vs 40).
- Prescribe the **reframe**, and state the **cost** of each option honestly.

## 4. Where it lives (governing law: *method in skill · facts in project · recipe per stack*)

Three homes, exactly the three Dan named ("skills and mobile review and design system"):

1. **`design-system.md`** — add a **"Design-judgment lens"** section: the 5 heuristics + a project-facts table that grounds each in Materials¹ specifics (the type tiers as the system-fidelity baseline, the gradient-word one-per-section rule, the locked-hero exception list, the known semantic cases — §05 video, §04 stretch, hero composition). This is the *facts* layer.
2. **`.claude/agents/mobile-reviewer.md` + `visual-reviewer.md`** — add a **diagnostic-reasoning layer** above the existing PASS/FAIL checklists. Today they report mechanical pass/fail (the mobile-reviewer *does* already say "no 56px heading jammed into 327px" — but it stops at flagging, it doesn't *reason*). Teach them to: run the 5-heuristic lens after the checklist; produce **cause → impact → reframe** findings; classify **intent vs accident**; judge whether deviations are **earned**; and, for design (not mechanical) calls, **render real pixels + compare alternatives** before recommending. Keep them report-only (no edits), desktop-led split intact.
3. **The S5 skills package** — this lens IS the core of the planned `responsive-refinement` skill (its "semantic design forks = don't shrink, reframe" is heuristic #4) and the generalized review agents. Seed a project-supplied **`design-review-principles.md`** (the OneRedOak-style principles file the master plan already calls for in Session 5) — the Layer-1 method that travels to other projects, with Materials¹ facts kept *out* of it.

## 5. Relationship to the master plan

This is **Session 5 work pulled forward**, scoped to the *design-judgment* slice: "generalize the two local review agents" + the `responsive-refinement` method. Update `docs/plans/2026-06-01-design-system-and-skills-package-plan.md` to note that the design-judgment lens was extracted early (during S3) because a live worked example surfaced it — which is exactly the plan's stated philosophy ("skills are written *after* the work is done by hand once").

## 6. In-flight Session 3 decisions — DO NOT LOSE THESE

The S3 *building* work was scoped and approved with Dan but **not yet built**. Decisions locked on real-pixel review:

- **§05 MacBook (mobile):** **Option A — portrait crop into the screen.** Tall phone frame (~4:5), `object-cover` zoom + `object-position` onto the open screen so the demo UI reads large; laptop chrome becomes an edge hint. CSS-only, reuses `/videos/macbook-demo-720.mp4`. **Phone-only** — revert to the landscape 2:1 frame at `md:` (tablet has the width; it's already legible there). Likely drop the lid-open scrub on phone (awkward when zoomed) and show the open end-state. Files: `section-05/MacbookDemo.tsx` (+ `useMacbookScrub.ts`).
- **Tablet (`md:`, 768–1023):** **Targeted 2-col.** All tablet layout lands as `md:` variants *inside the Mobile components* (every section switches Desktop/Mobile at `lg:`, so the Mobile component renders across the whole tablet band). Plan: 32px gutters (`md:px-8`) everywhere; **§05 pack cards 2-col**, **§03 plate-stack + testimonial 2-col**, **§02 output cards 2-up**; **§04 stays vertical but width-capped + centred** (horizontal recipe row deemed too big a lift). §01/§06 gutters/spot-check only.
- **Hero (mobile):** **40px (display tier)** + `text-wrap: balance` + **authored mobile line-breaks** (so "*creative* explorers." reads as a unit) + **scale the `CreativeWord` SVG** to track the smaller size. This *does* touch the locked hero — accepted. Files: `hero/HeroHeadline.tsx`, `hero/headlineLines.ts`, `hero/icons/CreativeWord.tsx`.
- **Wrap tweak:** only **§03 sub-line** gets `text-balance` ("Yours to apply across everything you make."). Dan **declined** the §04 "recipe." orphan tweak and the §05 catalog-header shorten.
- **Tap targets (viewport-safe):** §03 variant chips (`LibraryPlateStack.tsx:222`, `py-2` → ~35px) need `min-h-[44px]` + `inline-flex items-center` with a `lg:` reset to preserve the desktop chip height (shared component). Footer-pill `<a>` links (`FooterPill.tsx` `linkClass`, ~20px) need full pill-height hit area (`h-11 md:h-12` / padding) — vertical only; horizontal stays design-constrained by the compact pill.
- **Reduced-motion audit (punch-list #9):** CSS safety net already covers `[data-reveal]`, quote-words, hero opacity, `recipe-caret`, `material-shimmer`, `faq-reveal` (`globals.css` ~L299–364). **Verify the gaps:** `[data-cta-root]{opacity:0}` is **not** in the reduced-motion reset block (L345–350) — confirm `FloatingCta`/`useScrollReveal` reveal it under reduced motion via JS; and confirm `RecipeCarousel`, `RecipeInputType`, `useHeroTimeline`/`useHeroMobileTimeline` honour the flag.

**Sequencing options for the fresh session:** either (a) build the design-judgment lens *first*, then **dogfood** it by having the upgraded mobile-reviewer drive/validate the S3 build above (cleanest — proves the lens on a live case); or (b) treat the lens as a standalone meta-deliverable and run S3 building separately afterward. Recommend (a).

## 7. Watch-outs (carried from project memory)
- `[data-reveal]` has a global `opacity:0` rule — it must only mark animated leaves; structural/trigger markers use `data-row` etc. A layout change must not move/drop a reveal marker.
- Wrap every `ScrollTrigger.create` / `gsap.timeline({scrollTrigger})` with `deferGsap`.
- `preserve-3d` (LibraryPlateStack) pops at swaps when mask/shadow/filter/opacity flatten the layer — be careful editing its containers.
- Turbopack may serve stale `globals.css` on a long-running dev server — restart/verify.
- Keep type on the `.t-*` classes; no arbitrary `text-[]`/inline font styles.
- Feature branch only (`feat/design-system-foundation`); never commit to main; Dan controls commits via `/gitme`.
