# Design-System Consistency + Shareable Skills Package — Master Plan

**Date:** 2026-06-01
**Status:** Plan locked. Not yet executing. Intended to be dispatched across multiple sessions.
**Owner:** Dan
**Source conversation:** Brainstorm covering (a) tablet/mobile refinement, (b) pre-launch readiness, (c) design-system consistency across all formats, (d) a reusable, shareable skills package.

---

## 1. The problem, in one paragraph

Materials¹ looks fine section-by-section but has **no design system as an artifact**. `globals.css` defines only two tokens (`--font-display`, `--color-hero-bg`); every heading size, spacing value, and gradient is re-invented per section — half as inline `style={{}}` (§03, §04), half as Tailwind arbitrary values (§05, hero). Headings don't share a scale (Hero 56px · §03 60px · §04 60px · §05 56px, with leading/tracking drifting 1.08 / 1.15 / 1.1). Tablet is effectively unhandled — the site jumps mobile-base → `lg:` with almost no `md:`. Several pre-launch hygiene items are outstanding (40MB+ demo video, stray screenshot/jpeg files in the tree, no CI). Separately, Dan wants the *repeatable* parts of fixing all this distilled into **shareable skills** other people can use on their own (non-Next.js) sites.

## 2. Goals

1. **Get Materials¹ launch-ready** across desktop / tablet / mobile, on a real design system.
2. **Produce a shareable skills package** that encodes the *method* of doing 1, usable by people on other stacks (plain HTML/CSS, Tailwind, others).

These are two different deliverables braided together. The site is the proving ground; the skills are extracted from the proven work.

## 3. Governing law (applies to every skill we build)

> **Method in the skill · facts in the project · stack-recipes as swappable adapters.**

- **Method (Layer 1 — stack-agnostic):** the mindset, judgment, and audit checklist. *"A type scale needs distinct, non-overlapping steps on a consistent ratio; headings descend in clear hierarchy; metadata earns emphasis through caps + tracking, not size."* True in any stack. This is the **bulk** of each skill.
- **Facts (project-supplied):** the specifics live in the *target project's* own `design-system.md` / `globals.css` / `CLAUDE.md`, never baked into the skill. Materials¹'s gradient values, banned words, §05 video — all stay here, in this repo. Someone else's project supplies their own.
- **Recipe (Layer 2 — thin, per-stack adapter):** *"In Tailwind this is `@theme` tokens / arbitrary values; in plain CSS it's custom properties; in CSS-in-JS it's a theme object."* The principle decides *what's wrong*; the recipe shows *how to fix it in your stack*. **Tailwind and plain HTML/CSS get first-class recipes** (Dan's common cases). Everything else inherits the principle and adapts. We are explicitly **not** "supporting every framework."

Code appears in a skill only where it's genuinely universal (a shell command to run a linter) or inside a clearly-labelled per-stack recipe. Everything else is principle.

## 4. Sequencing decision

**Site first, extract skills after** — but with a **research sweep first**. Good skills are written *after* the work is done by hand once, because that's when you know which patterns actually repeat. Research goes first so we don't build skills that already exist.

Dependency order: `Research (0)` + `Design-system foundation (1)` → `Align (2)` → `Tablet/mobile (3)` → `Pre-launch (4)` → `Extract & package skills (5)`. Session 0 can run in parallel with Session 1.

---

## 5. Session breakdown (the dispatch list)

Each session is scoped to run semi-independently with a clear input, output, and definition-of-done. Hand them out one at a time.

### Session 0 — Research: the skills ecosystem ✅ DONE (2026-06-01)
- **Status:** Complete. Report at `docs/plans/2026-06-01-skills-ecosystem-research.md`. Verdicts folded into Session 5 below. Headline: only `design-system-consistency` is a true from-scratch build; the rest are adopt/orchestrate/generalize.
- **Goal:** Survey what already exists before we build anything. Don't reinvent the wheel.
- **Method:** `deep-research` skill (fan-out web search + verify). Also inventory locally-installed skills (`superpowers:*`, `frontend-design`, Vercel set).
- **Capabilities to research, with adopt / rework / build verdict each:**
  - design-system / type-scale consistency auditing
  - responsive + overflow refinement for tablet/mobile
  - pre-launch / ship-readiness checklists
  - mobile / visual review (we already have agents — what's the best-in-class to learn from?)
  - a11y auditing (axe, jsx-a11y) and perf (Lighthouse / Unlighthouse) — likely **adopt existing tooling, document how to wire it**, rather than build.
- **Output:** `docs/plans/2026-06-XX-skills-ecosystem-research.md` — per capability: what exists, quality, license, adopt/rework/build call, and "how to point others at it."
- **Done when:** every Session-5 skill has a clear adopt-vs-build decision backed by sources.
- **Depends on:** nothing. Low-regret. Can start immediately.

### Session 1 — Design-system foundation (Materials¹) ✅ DONE (2026-06-01)
- **Status:** Complete. Output note at `docs/plans/2026-06-01-session-1-design-system-output.md`. `design-system.md` authored at repo root (source of truth); tokens encoded in `globals.css` (`@theme` + `:root` + `.t-*` classes); CLAUDE.md placeholders filled; per-format scale smoke-tested at 375/768/1440. Decisions taken with Dan: 4px-grid curated scale (not modular), `mega`=72 kept, `display`=56, mobile display=40, real discrete `md:` tablet tier.
- **Goal:** Write the design system down as an artifact + define tokens. This is the source of truth everything aligns to, *and* the worked example the skills point at.
- **Work:**
  - Author `design-system.md`: type scale (display / h2 / h3 / lead / body / caps / micro) with size · leading · tracking · weight **per format (desktop / tablet / mobile)**; spacing scale; colour + gradient tokens; breakpoint strategy (incl. a real tablet tier); promote the element-box + technical-grid-line primitives.
  - Reconcile the fragmented heading sizes into one deliberate scale. Decide the canonical display size and the mobile/tablet steps (resolve 56 vs 60; 36 vs 40).
  - Encode tokens in `globals.css` `@theme` (and/or CSS custom properties) so sections can reference them.
- **Output:** `design-system.md` + expanded tokens in `globals.css`. No section migration yet.
- **Done when:** every type level + spacing + colour has a named token and a documented per-format value; CLAUDE.md's "to be locked" placeholders are filled.
- **Depends on:** nothing hard; informed by Session 0 if run first, but not blocked by it.
- **Blocks:** Sessions 2, 3, 4.

### Session 2 — Align the site to the system
- **Goal:** Migrate every section onto the tokens; fix hierarchy so it's *correct*, not just visually okay.
- **Work:** Replace inline `style={{}}` (§03, §04) and rogue arbitrary values with token-based classes/vars. Make headings descend in true hierarchy across hero / §02 / §03 / §04 / §05, all three formats. No visual regressions intended — this is consolidation, not redesign.
- **Output:** all sections reference tokens; zero rogue type values.
- **Done when:** a grep for inline font/size styles in section components returns nothing; headings match the documented scale.
- **Depends on:** Session 1.

### Session 3 — Tablet + mobile refinement
- **Goal:** Make tablet deliberate and fix mobile fit + the *semantic* rearrangements.
- **Work:**
  - Add an intentional tablet (`md:`) layer wherever the mobile→`lg:` jump is too coarse.
  - Mechanical: overflow, tap targets ≥44px, 24px gutters, no horizontal scroll.
  - **Semantic (brainstorm, not just bug-fix):** rearrange elements that don't merely *fit* badly but are *wrong* small. Flagship case: the **§05 macbook demo video** renders ~375×187px on a phone (same `aspect-[2/1]` frame as desktop) — too small to read. Fix is to **re-crop / reframe for mobile** (taller frame, different `object-position`, or a portrait-oriented source), not to shrink. Sweep for other "rearrange to work better" cases.
  - Run `mobile-reviewer` agent as the gate (375 + 390). Verify `prefers-reduced-motion` fallbacks on every motion element.
- **Output:** tablet tier exists where needed; §05 video legible on mobile; mobile-reviewer green.
- **Done when:** mobile-reviewer report has no unresolved technical findings; design judgments surfaced to Dan.
- **Depends on:** Sessions 1–2.

### Session 4 — Pre-launch readiness sweep
- **Goal:** The "before we go live" checklist — audit + fix.
- **Checklist (the answer to "what do I need to double-check for go-live"):**
  - **Build/quality:** `pnpm lint` clean · `tsc` strict clean · `pnpm build` succeeds · `pnpm test` green · no console errors/warnings in browser.
  - **Performance / assets:** the **40MB+ `macbook-demo.mp4`** and other videos (`footer.mp4`) — compress, confirm poster + `preload` strategy, serve right sizes; image optimization; check Lighthouse perf/LCP/CLS.
  - **Accessibility:** decorative element boxes `aria-hidden`; captions exposed to AT; colour contrast; focus states; keyboard nav; reduced-motion respected.
  - **SEO / metadata:** title/description, Open Graph + Twitter card, favicons, `og:image`, canonical, `robots`/`sitemap` if wanted.
  - **Repo hygiene:** clean up stray files in the working tree (many root-level `*.jpeg` screenshots, `docs/Screenshot *.png`); confirm `.gitignore`; remove dead assets; ensure `public/` only ships what's used.
  - **Deploy:** confirm Vercel project config; consider a minimal CI (lint + typecheck + build) — currently none.
- **Output:** a green checklist + the fixes. This becomes the backbone of the `pre-launch-sweep` skill.
- **Done when:** every checklist item passes or has a logged, accepted exception.
- **Depends on:** Sessions 2–3 substantially done.

### Session 5 — Extract & package the shareable skills
- **Goal:** Distill the *method* from Sessions 1–4 into two-layer, shareable skills; fold in Session 0's adopt decisions.
- **Tooling:** `superpowers:writing-skills` (the Skill-Creator equivalent in this environment).
- **Session 0 reset the scope — only ONE of four candidates is a real build.** Full research at `docs/plans/2026-06-01-skills-ecosystem-research.md`. Revised set:
  1. **`design-system-consistency` — BUILD (method-only).** No good *audit/consolidation* skill exists (official `frontend-design`/`brand-guidelines`/`theme-factory` are all generative, **zero overlap** — the plan's earlier hunch about `frontend-design` was wrong). Build only the *method* (reconcile scale, rewrite rogue inline styles onto tokens). **ADOPT `uxKero/anydesign` (MIT, ★84)** for the token-capture / DTCG-export / live-CSS drift half — that's the "facts in the project" layer; don't build token extraction.
  2. **`responsive-refinement` — ADOPT `kylezantos/responsive-craft` (MIT, ★32).** Already implements our exact philosophy: semantic "design forks" = our "don't shrink, reframe"; audit mode; 375/768/1024/1440 preview; `ai-failure-patterns.md`; Tailwind + vanilla adapters. *Caveat: low adoption — adopt-but-validate output before depending on it; light rework at most.* **Do not build from scratch.**
  3. **`pre-launch-sweep` — BUILD thin orchestrator only.** Sequence + go/no-go + exception log that *delegates* audits. Bake in NO perf/a11y logic — delegate that to adopted tooling below or it just becomes a worse `web-quality-skills`.
  4. **Mobile/visual review — KEEP local agents, generalize.** Our `mobile-reviewer`/`visual-reviewer` are already better-targeted than community options (stricter viewport discipline, desktop-led override). Externalize the brand-specific bullets into a project-supplied `design-principles.md` (mirrors `OneRedOak/.../design-review`, MIT, ★3.8k). Ship the generalized agents in the package.
  5. **Accessibility + Performance — ADOPT tooling, document wiring.** **`addyosmani/web-quality-skills` (Addy Osmani / Chrome, MIT, ★2.1k)** is the single highest-authority adopt — framework-agnostic perf + Core Web Vitals + a11y + SEO + best-practices following the official spec. Plus axe / eslint-plugin-jsx-a11y / Lighthouse CI / Unlighthouse as the underlying tools.
- **Licensing gate (hard constraint for a shareable package):** only **MIT** sources are safe to bundle/fork (`web-quality-skills`, `responsive-craft`, `anydesign`, `OneRedOak`, `Community-Access/accessibility-agents`). The two most design-audit-relevant community skills (`claude-design-auditor-skill`, `website-audit-skill`) have **NO license** — cite/learn-from only, never redistribute.
- **Packaging:** a README explaining install, the governing law (method/facts/recipe), how a user points each skill at *their* project's own `design-system.md` / `design-principles.md`, and which third-party skills to adopt rather than duplicate. **Distribution model TBD** (see Open decisions): fork-and-bundle vs. adopt-by-reference.
- **Output:** the skills package, shareable. Net: 1 skill written from scratch, 1 thin orchestrator, 1 adopt, 2 generalized agents, 1 adopted toolkit.
- **Done when:** each skill runs against a non-Materials¹ example (even a toy plain-HTML site) and produces sensible output without Materials¹ facts leaking in.
- **Depends on:** Sessions 0–4.

---

## 6. Concrete known-issue punch-list (so nothing gets lost)

| # | Issue | Where | Owning session |
|---|-------|-------|----------------|
| 1 | Heading sizes fragmented (56/60/36/40; leading/tracking drift) — **S1 ✅ scale locked** in `design-system.md` (mega 72 · display 56 · h2 44 · h3 32, per-format); section migration → S2 | hero, §03, §04, §05 | 1 → 2 |
| 2 | Inline `style={{}}` for type | §03, §04 components | 2 |
| 3 | ~~Only 2 tokens in `globals.css`~~ — **S1 ✅ DONE**: full token set (`@theme` palette/breakpoints · `:root` type/gradient/atmosphere vars · `.t-*` responsive classes) | `src/app/globals.css` | 1 |
| 4 | No tablet (`md:`) strategy — binary mobile→`lg:` | all sections | 3 |
| 5 | §05 macbook video ~375×187px on mobile, illegible | `section-05/MacbookDemo.tsx` | 3 |
| 6 | 40MB+ `macbook-demo.mp4` + other heavy video | `public/videos/` | 4 |
| 7 | Stray screenshots/jpegs in working tree | repo root, `docs/` | 4 |
| 8 | No CI (lint/typecheck/build gate) | repo | 4 |
| 9 | reduced-motion fallback audit on every motion element | all motion | 3 → 4 |

## 7. Open decisions (deferred, not blocking)

- Final canonical display size (56 vs 60) and the mobile/tablet steps — decided in Session 1.
- Whether to introduce a true tablet *layout* (not just type scaling) for any section — decided in Session 3 per-section.
- §05 mobile video approach: taller crop vs. portrait source vs. reposition — brainstorm in Session 3.
- ~~Final skill list + names — confirmed after Session 0 research.~~ **RESOLVED** (see Session 5): build `design-system-consistency` (method-only) + thin `pre-launch-sweep` orchestrator; adopt `responsive-craft` + `web-quality-skills` + `anydesign`; generalize the two local review agents.
- ~~Whether the mobile-reviewer agent ships inside the package or stays local~~ **RESOLVED:** generalize and ship (externalize brand bullets to project-supplied `design-principles.md`).
- **Distribution model — Session 5.** Fork-and-bundle (self-contained package, we own maintenance) vs. adopt-by-reference (thin package that points at upstream MIT skills + our glue + our one original skill; lighter, but depends on upstreams staying maintained). Licensing-gated: only MIT sources bundlable.
- **`responsive-craft` trust level — Session 5.** Low adoption (★32); validate its output on a real case before depending on it, else fall back to building our own.

## 8. How to use this doc

Dispatch sessions in dependency order. Each session should: read this plan + the target section's code, do its scoped work, update its row(s) in the punch-list, and write its own output doc under `docs/plans/`. Session 0 and Session 1 can start in parallel today.
