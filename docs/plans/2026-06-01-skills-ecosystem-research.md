# Skills Ecosystem Research — Session 0

**Date:** 2026-06-01
**Session:** 0 of the Design-System + Skills-Package plan (`docs/plans/2026-06-01-design-system-and-skills-package-plan.md`)
**Goal:** Before building the four candidate skills in Session 5, find what already exists so we don't reinvent the wheel. Per-capability adopt / rework / build verdict, backed by live-web sources.
**Method:** Live web search + GitHub API (training data is stale on this fast-moving area; every star/date/license below was pulled from the GitHub API or live pages on 2026-06-01).

> **One-line bottom line:** Two of our four candidate skills already exist in good, fresh, MIT-licensed, stack-agnostic form (`responsive-craft` ≈ our responsive-refinement; `web-quality-skills` covers a11y+perf+SEO outright). A third (`design-system-consistency`) has a strong *facts-layer* dependency already built (`anydesign` → `design.md` + DTCG tokens + drift check) but no good *method-layer* audit skill — that's a real BUILD. The visual/mobile-review gate is the one place our local agents are already better-targeted than what's out there, but `OneRedOak/design-review` is the reference to mine.

---

## Summary verdict table

| # | Capability | Verdict | Key source(s) | Note |
|---|-----------|---------|---------------|------|
| 1 | design-system-consistency (type/spacing/hierarchy audit → tokens) | **BUILD** (method) **+ ADOPT** (facts layer) | `uxKero/anydesign` (MIT, ★84), `Ashutos1997/claude-design-auditor-skill` (no license, ★51) | No good stack-agnostic *consolidation/method* skill exists. Adopt `anydesign` for the facts layer (design.md + DTCG tokens + drift check); build the audit/consolidation method on top. |
| 2 | responsive-refinement (overflow/tap/gutter + semantic reframe) | **ADOPT / light REWORK** | `kylezantos/responsive-craft` (MIT, ★32) | Near-1:1 match incl. "design forks" = our "don't shrink, reframe", audit mode, `ai-failure-patterns.md`, Tailwind+vanilla recipes. Low stars but fresh + exactly our philosophy. |
| 3 | pre-launch-sweep (lint/build/perf/a11y/SEO/hygiene gate) | **BUILD** (thin orchestrator) **+ ADOPT** sub-tools | `addyosmani/web-quality-skills` (MIT, ★2.1k) for perf/a11y/SEO; `appariciojunior/website-audit-skill` (no license, ★23) for content QA | No single trustworthy ship-gate skill. "ship-gate" exists only buried in a low-trust mega-repo. Build a thin checklist that *invokes* adopted tools. |
| 4 | mobile / visual review gate | **REWORK from reference; KEEP local** | `OneRedOak/claude-code-workflows/design-review` (MIT, ★3.8k) | Reference design-review subagent (Stripe/Airbnb/Linear principles, Playwright MCP, project-supplied principles via CLAUDE.md). Our local `mobile-reviewer`/`visual-reviewer` are already better-targeted; generalize ours, mine OneRedOak for structure. |
| 5 | accessibility auditing | **ADOPT tooling** | `addyosmani/web-quality-skills` accessibility skill; `Community-Access/accessibility-agents` (MIT, ★286); raw `axe-core` + `eslint-plugin-jsx-a11y` + Playwright `@axe-core/playwright` | Confirmed: adopt + document how to wire. Don't build a-from-scratch a11y skill. |
| 6 | performance / Lighthouse | **ADOPT tooling** | `addyosmani/web-quality-skills` core-web-vitals/performance; Lighthouse CI, Unlighthouse | Confirmed: adopt. `web-quality-skills` is the canonical wrapper (Addy Osmani / Chrome). |

---

## Local skills already on hand (inventory)

Pulled from `/Users/Danny/.claude/plugins/` and the project `.claude/`.

**Installed plugins (user + project scope):**
- `superpowers@claude-plugins-official` v4.0.3 — brainstorming, writing-skills, writing-plans, executing-plans, subagent-driven-development, dispatching-parallel-agents, TDD, systematic-debugging, verification-before-completion, requesting/receiving-code-review, using-git-worktrees, finishing-a-development-branch, using-superpowers.
- `frontend-design@claude-plugins-official` — **generative only.** "Create distinctive, production-grade frontend interfaces… avoid generic AI slop." It is a *build-new-UI* skill (typography/colour/motion/composition direction). It does **not** audit, consolidate, or check consistency. **Zero overlap with design-system-consistency** — important: don't assume `frontend-design` covers it.
- `compound-engineering@every-marketplace` v2.30.0 (installed local to another project) — has `agents/design/design-implementation-reviewer.md` (Figma-fidelity pixel-compare, needs Figma MCP — different job from ours), `code-simplicity-reviewer`, `performance-oracle`, `security-sentinel`, plus a `skill-creator`/`create-agent-skills` skill. Its `frontend-design` skill is a copy of the official one.
- `vercel` plugin set — Next.js/Vercel deploy/CI skills (deployments-cicd, verification, vercel-cli). Useful for Session 4's deploy/CI item, not for the portable skills.

**Project-local agents (`materials-website/.claude/agents/`):**
- `mobile-reviewer.md` — Playwright-driven, 375/390/360, technical + aesthetic checklists, writes a report, does not edit code. Already largely principle-based; the only Materials¹-specific bits are the brand-fidelity bullets (cool chrome, Jakarta, gradient-word rule, element boxes). **This is genuinely good and close to shippable as a generalized skill.**
- `visual-reviewer.md` — desktop-first (project override), static-composition + cross-component-collision focus, on-request only. Same shape.

**Superpowers coverage check (does any existing local skill already cover our four?):**
- `writing-skills` — the tool we'll *use* in Session 5 to author skills (skill-creator equivalent). Not a target capability.
- `requesting/receiving-code-review`, `verification-before-completion` — cover *code* correctness and "did I actually finish", **not** design-system / responsive / pre-launch / visual concerns. No overlap with our four.
- `frontend-design` (above) — generative, no overlap.
- **Conclusion: none of the installed superpowers/frontend-design skills cover capabilities 1–4.** The gap is real.

---

## Capability 1 — design-system-consistency

**What we want:** audit any site for type-scale / spacing / hierarchy *drift* and consolidate onto tokens. Method (judgment) in the skill; facts (the project's own scale) supplied by the project; Tailwind + plain-CSS recipes.

**What exists:**

- **`uxKero/anydesign`** — MIT, ★84, last push 2026-05-19, v0.4.0. *"Turn any image, website, or Figma file into a structured `design.md`"* + `design-tokens.json` in **W3C DTCG** format + an optional `design-a11y.md` WCAG contrast report. Ships `verify_design.py` which *"reports drift between declared values and current CSS"* (reads your tokens, fetches the live URL, extracts CSS custom properties, diffs). Inferences carry confidence markers (✅/⚠️/❓) and an "Open Questions" section — judgment-informed, not blind extraction. Exports to **DTCG JSON, CSS custom properties, or `tailwind.config.ts`** — i.e. *exactly* our two first-class recipes.
  - **Fit:** This is the **facts layer** of our governing law, already built and portable. It generates the per-project `design.md`/tokens that our skill's principle layer would otherwise have nothing to point at. It does NOT do the *consolidation method* (reconcile 56 vs 60, decide a canonical scale, rewrite rogue inline `style={{}}` onto tokens, enforce a ratio) — that judgment is the bulk of what we'd build.
- **`Ashutos1997/claude-design-auditor-skill`** — no license file (★51, last push 2026-05-17, v1.2.13). Audits against **19 design rules** incl. Typography (hierarchy, font count, sizing, line-height), Spacing (8-pt grid), Visual Hierarchy, Consistency, Design Tokens. Reads code (HTML/CSS/React/Vue) or Figma-via-MCP; confidence levels. Rules-based with plain-language reasoning.
  - **Fit:** Closest existing thing to a design *audit*, but: (a) **no license** (can't redistribute/fork cleanly), (b) it's a broad 19-category usability auditor, not a focused *type-scale/spacing-drift → consolidate-onto-tokens* tool, (c) it produces findings, not the consolidation. Useful to mine for its rule thresholds, not to adopt wholesale.
- Official `anthropics/skills`: `brand-guidelines` and `theme-factory` were checked directly — both **apply/generate** styling to artifacts; neither audits existing code for drift. `frontend-design` is generative. **No official skill does this.**

**Verdict: BUILD the method skill + ADOPT `anydesign` for the facts layer.**
The "audit type-scale/spacing/hierarchy drift and consolidate onto a deliberate scale" *judgment* doesn't exist as a clean, licensed, stack-agnostic skill. That's the half worth building (and it's exactly what Session 1–2 produces by hand). Don't rebuild token extraction or DTCG export — point users at `anydesign` to produce their project's `design.md`, then our skill supplies the method to critique and consolidate it.

**How to point others at it:** `anydesign` (uxKero) to capture/verify their tokens; our `design-system-consistency` skill on top for the reconcile-and-consolidate judgment. Cite `claude-design-auditor-skill` as prior art for rule thresholds (but note the missing license).

---

## Capability 2 — responsive-refinement

**What we want:** find overflow / tap-target / gutter problems on tablet+mobile **and** brainstorm *semantic* rearrangements ("don't shrink, reframe" — the §05 macbook-video case). Recipes per stack.

**What exists:**

- **`kylezantos/responsive-craft`** — MIT, ★32, last push 2026-04-04. This is a strikingly close match:
  - **Audit mode** (`/responsive-craft audit`): *"audits your current codebase's responsive implementation, identifies issues and ambiguous translations, and fixes them in priority order"* — overflow/containment, touch-target sizing, gutter/spacing consistency, breakpoint appropriateness.
  - **Live preview** at **375 / 768 / 1024 / 1440** (our exact tablet-gap concern).
  - **"Design forks"** — its headline differentiator, and it *is* our "don't shrink, reframe" mindset stated almost verbatim: *"When a responsive translation has multiple valid approaches — a sidebar that could become a drawer, tabs, or an accordion; a data table that could scroll, stack as cards, or hide columns — the skill presents 2–3 options with tradeoffs and asks you to choose."* 8 documented fork patterns (sidebar, data tables, dashboards, complex heroes, multiple sticky elements, deep nav, complex forms, bento grids).
  - **`ai-failure-patterns.md`** — 13 recurring AI responsive mistakes (100vh on mobile, desktop-first queries, missing `min-width:0` on flex children, `overflow:hidden` killing sticky, iOS input zoom, z-index escalation), each with bad output → why → correct pattern. This is a ready-made reference doc for our skill.
  - **Stack-agnostic with adapters:** detects Tailwind (responsive modifiers, `@container`, `@theme`), component libs (MUI/Chakra/shadcn), CSS-in-JS, and vanilla CSS — i.e. it already implements the Layer-2 recipe pattern.
  - **Method-not-diff:** insists on behaviour specs per component before writing CSS.

**Fit:** This is our `responsive-refinement` candidate, already built, MIT-licensed, fresh, and aligned to the governing law (method + per-stack recipes + semantic-reframe). The only weakness is low adoption (★32) and it doesn't know our §05 video case specifically — but that's the *facts* layer, which is correctly the project's job.

**Verdict: ADOPT, with a light REWORK** if anything. Use it directly for Session 3; if we ship our own, it should be a thin extension that adds our project's facts (the §05 reframe, 44px target, 24px gutter) and possibly a tighter tablet-tier focus, not a from-scratch rebuild.

**Caveat to verify in Session 3:** ★32 means low real-world battle-testing. Validate its audit output against Materials¹ before relying on it as the gate. Also note `awesome-skills/mobile-app-design` exists but is React-Native-oriented (iOS/Android touch targets) — not our web target.

**How to point others at it:** `kylezantos/responsive-craft` (MIT) directly; reference its `ai-failure-patterns.md` as the canonical overflow/viewport gotcha list.

---

## Capability 3 — pre-launch-sweep

**What we want:** a ship-readiness gate — lint/typecheck/build, perf/asset-weight, a11y, metadata/SEO, dead-file cleanup.

**What exists:**

- **`addyosmani/web-quality-skills`** — MIT, ★2.1k, last push 2026-05-09. Six skills: `web-quality-audit` (umbrella), `performance`, `core-web-vitals` (LCP/INP/CLS), `accessibility` (WCAG 2.2), `seo`, `best-practices` (security headers, modern APIs). **Explicitly framework-agnostic** (*"Works with any framework: React, Vue, Angular, Svelte, Next.js, Nuxt, Astro, plain HTML, and more"*), follows the Agent Skills spec, encodes patterns from 150+ Lighthouse audits. **By Addy Osmani (Google Chrome) — the most authoritative source in this list.** This covers the *perf + a11y + SEO + best-practices* slices of our pre-launch checklist outright.
- **`appariciojunior/website-audit-skill`** — no license, ★23, last push 2026-04-13. Stack-agnostic content/UX/copy/conversion QA (spelling, broken links, duplicate content, alt-text quality, SEO basics). Crawls and reads content; doesn't render or run tools. *"Run it before launch."* Useful for the copy/content slice.
- **"ship-gate"** (89 checks / 8 categories, MIT, stdlib-only) — exists **only as a buried external contribution inside `alirezarezvani/claude-skills`**, a 337-skill mega-repo. Mega-collections like this are a known low-trust pattern (drive-by aggregation, thin per-skill quality, hard to audit). Not recommended as a primary dependency; mine its category list at most.
- Official `webapp-testing` (anthropics/skills) — confirmed via SKILL.md: it's an **interactive Playwright debugging/exercise helper**, *explicitly excludes* lint/typecheck/build/SEO/a11y/perf. Good for the "smoke-test the running app" step, not the gate itself.

**Verdict: BUILD a thin orchestrator + ADOPT the sub-tools.** No single trustworthy ship-gate skill exists. The right shape is exactly our plan's: a thin `pre-launch-sweep` that runs universal shell commands (`pnpm lint`, `tsc`, `pnpm build`, `pnpm test`) and then **invokes adopted tools** — `web-quality-skills` for perf/a11y/SEO/best-practices, `knip`/`depcheck` for dead files/exports, and a repo-hygiene pass. The value we add is the *sequencing + judgment + accepted-exception log*, not reimplementing audits.

**How to point others at it:** our `pre-launch-sweep` is the checklist + orchestration; it delegates to `addyosmani/web-quality-skills` (perf/a11y/SEO) and standard CLI tools (knip/depcheck for dead code, Lighthouse CI for the perf budget in CI).

---

## Capability 4 — mobile / visual review gate

**What we want:** automated review of a *rendered* page against design/usability principles. We already have local `mobile-reviewer` + `visual-reviewer`.

**What exists:**

- **`OneRedOak/claude-code-workflows/design-review`** — MIT, ★3.8k, last push **2025-09-14** (8 months stale, but still the de-facto reference). A `/design-review` slash command + design-review subagent: **Playwright MCP** live-environment testing (not static code), multi-phase (interaction flows → responsiveness → visual polish → accessibility WCAG AA+ → robustness → code health), principles *"inspired by Stripe, Airbnb, Linear."* **Crucially aligned to our governing law:** design principles are *project-supplied* via a `design-principles-example.md` and/or the project's `CLAUDE.md` — facts in the project, method in the agent. This is the best-in-class structure to learn from.
- Our local `mobile-reviewer` / `visual-reviewer` are **narrower but better-targeted**: explicit 375/390/360 viewport order, technical + aesthetic split, desktop-led override, report format, "never claim a pass you didn't screenshot." The only project-coupling is the brand-fidelity bullets.
- `compound-engineering/design-implementation-reviewer` — Figma-pixel-fidelity compare; needs Figma MCP; different job (design↔build parity, not principle review). Not our gate.

**Verdict: KEEP + generalize our local agents; REWORK the multi-phase structure from OneRedOak.** Our agents already do the job and embody the right discipline. For the shareable package: lift the brand-specific bullets out into a project-supplied `design-principles.md` (mirroring OneRedOak's pattern), keep the viewport/technical/aesthetic skeleton, and add OneRedOak's phase taxonomy (interaction/responsive/polish/a11y/robustness) where ours is thinner. Don't adopt OneRedOak wholesale — it's staler than our agents and less viewport-disciplined — but cite it as the reference and borrow its phase model + "principles live in the project" split.

**How to point others at it:** ship our generalized reviewer in the package; in the README, credit `OneRedOak/claude-code-workflows` as the reference design-review workflow and point users who want the Stripe/Airbnb/Linear principle set at it.

---

## Capability 5 — accessibility auditing (confirm "adopt, don't build")

**Confirmed: ADOPT existing tooling + document how to wire it.** Multiple options, in descending order of fit:

- **`addyosmani/web-quality-skills` → `accessibility` skill** (MIT, ★2.1k) — already adopted for Capability 3; covers WCAG 2.2, stack-agnostic. Best default.
- **`Community-Access/accessibility-agents`** — MIT, ★286, last push 2026-05-28, v5.4.0. Large multi-agent WCAG 2.2 AA suite (web/doc/PR review), integrates axe-core, runs on Claude Code/Copilot/Gemini/Codex + an MCP server with 24 scanning tools. Heavier than we need but mature and maintained — good for a deep a11y pass.
- Underlying tools to wire directly: **`axe-core`** (runtime DOM scan), **`@axe-core/playwright`** (in the Playwright we already run), **`eslint-plugin-jsx-a11y`** (static, build-time — Next.js relevant), plus `anydesign`'s `design-a11y.md` for contrast pairs.
- `airowe/claude-a11y-skill` (no license, ★10) — thin wrapper over axe-core + jsx-a11y; fine but no license and tiny. The raw tools or `web-quality-skills` are better.
- **Caveat:** automated a11y tooling catches ~30–50% of WCAG issues; keyboard-nav + reduced-motion + AT-exposure checks (already in our reviewers) remain a judgment task. The plan's instinct (tooling for the mechanical, agent for the judgment) is right.

---

## Capability 6 — performance / Lighthouse (confirm "adopt, don't build")

**Confirmed: ADOPT.** 

- **`addyosmani/web-quality-skills` → `performance` + `core-web-vitals` skills** (MIT, ★2.1k) is the canonical Claude-skill wrapper — authoritative author, framework-agnostic, follows the spec. **This is the one-line recommendation: don't build a perf skill; use this.**
- Underlying tooling to orchestrate in CI: **Lighthouse CI** (`@lhci/cli`, budgets + GitHub Action), **Unlighthouse** (multi-page Lighthouse crawl, good for a whole-site sweep), WebPageTest for deep dives. For Materials¹'s Session 4 specifics (40MB+ `macbook-demo.mp4`, asset weight, LCP/CLS), Lighthouse CI with a perf budget is the concrete wiring.

---

## Challenge the plan

Fresh-eyes pushback on the four candidate skills, as requested.

1. **`responsive-refinement` is probably not a BUILD — it already exists as `responsive-craft` (MIT).** This is the strongest "you're about to reinvent X" flag. Its "design forks" concept is *our* "don't shrink, reframe" mindset, near-verbatim, with audit mode + multi-breakpoint preview + an `ai-failure-patterns.md` we'd otherwise write from scratch + Tailwind/vanilla adapters. **Recommendation:** in Session 3 use it as-is; in Session 5 ship a thin extension (or just a wrapper + our project facts), not a ground-up skill. The only risk is its low adoption (★32) — validate output quality before depending on it.

2. **`design-system-consistency` should be split, not built monolithic.** The token-capture + DTCG export + drift-check half is already done by `anydesign` (MIT) and is the *facts* layer that the governing law says shouldn't live in the skill anyway. **What's genuinely missing — and worth building — is only the *consolidation method*:** reconcile a fragmented scale into one deliberate ratio, decide canonical sizes (the 56-vs-60 call), and rewrite rogue inline/arbitrary values onto tokens. Build that thin method skill; adopt `anydesign` underneath. Don't build token extraction.

3. **`pre-launch-sweep` should be explicitly framed as an *orchestrator*, not an auditor.** The temptation is to bake perf/a11y/SEO checks into it. Don't — `web-quality-skills` already does those better. Our skill's whole value is the *sequence + go/no-go judgment + accepted-exception log* wrapping universal shell commands and delegated tools. Frame it that way in the spec or it'll bloat into a worse copy of `web-quality-skills`.

4. **The mobile/visual-review "skill" is really an *agent*, and ours is already ahead.** Don't convert the reviewers into skills for the sake of the package; ship them as agents with the brand facts externalized into a project-supplied `design-principles.md` (the OneRedOak pattern). The plan's "likely generalize and include" instinct is correct — just keep them as agents.

5. **Merge candidates 1 and 4's facts mechanism.** Both want "the project's own design system as supplied facts." `anydesign`'s `design.md` + DTCG tokens can be the *single* facts artifact that both `design-system-consistency` (audits against it) and the review gate (reviews against it) point at. One facts file, two consumers — cleaner than each skill inventing its own.

6. **A capability we (mostly) MISSED: SEO/metadata + repo-hygiene as first-class.** The plan folds SEO/metadata and dead-file cleanup inside `pre-launch-sweep`, which is fine, but note the concrete adoptable pieces: `web-quality-skills` has a dedicated `seo` skill (covers OG/Twitter/JSON-LD/canonical), and dead-code is a solved tooling problem (`knip`, `depcheck`, `ts-prune`) — don't hand-roll dead-file detection. Wire the tools; the skill just runs and judges them.

7. **Licensing watch-out for the package.** If the shareable package *bundles* or forks anything, only MIT-licensed sources are clean: `web-quality-skills`, `responsive-craft`, `anydesign`, `accessibility-agents`, `OneRedOak`. The two most design-audit-relevant community skills — `claude-design-auditor-skill` and `website-audit-skill` — have **no license file**, so they can be cited/learned-from but **not redistributed**. Keep those at arm's length.

### Net effect on the Session-5 skill list

| Candidate | Recommended disposition |
|-----------|------------------------|
| design-system-consistency | **BUILD** — but only the consolidation *method*; adopt `anydesign` for facts/tokens/drift |
| responsive-refinement | **DROP the from-scratch build → ADOPT `responsive-craft`**; ship at most a thin facts-extension |
| pre-launch-sweep | **BUILD as a thin orchestrator** that delegates to `web-quality-skills` + CLI tools (knip/Lighthouse CI) |
| mobile/visual review gate | **KEEP as generalized agents** (externalize brand facts); mine `OneRedOak/design-review` for phase structure |

So of the four, **one is a clear build (design-system-consistency, method-only), one is a thin orchestrator (pre-launch-sweep), one is an adopt-with-thin-extension (responsive-refinement), and one is a generalize-our-existing-agent (review gate).** Only one truly new skill needs writing from scratch.

---

## Sources

Official / Anthropic:
- anthropics/skills repository — https://github.com/anthropics/skills (★145k; 17 skills incl. frontend-design, brand-guidelines, theme-factory, webapp-testing, web-artifacts-builder, skill-creator; last push 2026-05-29)
- frontend-design SKILL — https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md
- webapp-testing SKILL — https://github.com/anthropics/skills/blob/main/skills/webapp-testing/SKILL.md

Capability-specific (verdict-driving):
- uxKero/anydesign — https://github.com/uxKero/anydesign (MIT, ★84, 2026-05-19)
- Ashutos1997/claude-design-auditor-skill — https://github.com/Ashutos1997/claude-design-auditor-skill (no license, ★51, 2026-05-17)
- kylezantos/responsive-craft — https://github.com/kylezantos/responsive-craft (MIT, ★32, 2026-04-04)
- addyosmani/web-quality-skills — https://github.com/addyosmani/web-quality-skills (MIT, ★2.1k, 2026-05-09)
- appariciojunior/website-audit-skill — https://github.com/appariciojunior/website-audit-skill (no license, ★23, 2026-04-13)
- OneRedOak/claude-code-workflows (design-review) — https://github.com/OneRedOak/claude-code-workflows/tree/main/design-review (MIT, ★3.8k, 2025-09-14)
- Community-Access/accessibility-agents — https://github.com/Community-Access/accessibility-agents (MIT, ★286, 2026-05-28)
- airowe/claude-a11y-skill — https://github.com/airowe/claude-a11y-skill (no license, ★10, 2026-01-24)

Discovery / awesome-lists:
- travisvn/awesome-claude-skills — https://github.com/travisvn/awesome-claude-skills
- ComposioHQ/awesome-claude-skills — https://github.com/ComposioHQ/awesome-claude-skills
- bergside/awesome-design-skills — https://github.com/bergside/awesome-design-skills (67 *generative* design-direction skills; MIT, ★1.1k — none are auditors)
- alirezarezvani/claude-skills — https://github.com/alirezarezvani/claude-skills (337-skill mega-repo; "ship-gate" lives here — low-trust, cite-only)
- Unlighthouse — https://unlighthouse.dev/learn-lighthouse
