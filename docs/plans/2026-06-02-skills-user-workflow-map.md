# Design-System Foundations — the user's workflow (teaching map)

**Date:** 2026-06-02
**Audience:** someone you're teaching to use the shareable skills package on **their own** site (any stack — Tailwind & plain HTML/CSS are first-class).
**Sources:** `2026-06-01-design-system-and-skills-package-plan.md` (the arc) + `2026-06-01-skills-ecosystem-research.md` (adopt/build verdicts, verified invocations).

---

## The one idea to teach first: the governing law

> **Method in the skill · facts in *your* project · recipes per stack.**

Every skill below carries **judgment that's true on any site** (the method). It points at **your own** `design-system.md`, `design-tokens.json`, `design-principles.md` (the facts). And it adapts to **your stack** via a thin recipe (Tailwind `@theme` / plain-CSS custom properties / CSS-in-JS theme object). Nothing brand-specific is baked into a skill — the user always supplies their own facts.

This is why the package is mostly *adopt*, not *build*: **only one skill is written from scratch.**

| Type | Count | Which |
|---|---|---|
| 🟣 **BUILD** (from scratch, method-only) | 1 | `design-system-consistency` |
| 🟣 **BUILD** (thin orchestrator) | 1 | `pre-launch-sweep` |
| 🟢 **ADOPT** (MIT, used as-is) | 3 | `anydesign` · `responsive-craft` · `web-quality-skills` |
| 🔵 **AGENTS** (ours, generalized) | 2 | `mobile-reviewer` · `visual-reviewer` |
| ⚙️ **TOOLING** (universal CLI) | — | `knip`/`depcheck` · Lighthouse CI / Unlighthouse |
| 🧭 **SPINE** (superpowers, wrap everything) | — | brainstorming · writing-plans · executing-plans · code-review · verification |

---

## The journey (6 stations)

```text
  ┌─ START ─────────────────────────────────────────────────────────────────────
  │  A site that "looks fine" but quietly drifts
  └──────────────────────────────────────────────────────────────────────────────

  ╔═ 🧭 PROCESS SPINE — wraps EVERY station (superpowers) ═══════════════════════╗
  ║  brainstorming ──▶ writing-plans ──▶ executing-plans ──▶ code-review + verify  ║
  ║  every station below  =  brainstorm ▸ plan ▸ do ▸ review ▸ verify              ║
  ╚════════════════════════════════════════════════════════════════════════════════╝
     │
     ▼
  ┌─ ② CAPTURE & CONSOLIDATE the design system ─────────────────────────────────
  │  anydesign · ADOPT (MIT)                  design-system-consistency · BUILD
  │  site/Figma/image → design.md             (method — the ONE from-scratch skill)
  │  + design-tokens.json (DTCG)   ─ facts ─▶ reconcile scale · pick canonical
  │  verify_design.py = live drift            sizes (56-vs-60) · inline/arb → tokens
  └──────────────────────────────────────────────────────────────────────────────
     │  tokens locked · code on tokens
     ▼
  ┌─ ③ RESPONSIVE refinement (tablet + mobile) ─────────────────────────────────
  │  responsive-craft · ADOPT (MIT)
  │  /responsive-craft audit   @ 375 · 768 · 1024 · 1440
  │  "design forks"  =  DON'T SHRINK, REFRAME
  │  ai-failure-patterns.md  (13 recurring AI responsive gotchas)
  └──────────────────────────────────────────────────────────────────────────────
     │  no overflow · tap ≥44px · reframed, not shrunk
     ▼
  ┌─ ④ REVIEW GATE  (rendered page, not code) ──────────────────────────────────
  │  mobile-reviewer + visual-reviewer · GENERALIZED AGENTS
  │  Playwright · real viewports (375/390 mobile · desktop-led visual)
  │  writes a report · never claims a pass it didn't screenshot
  │  reads YOUR design-principles.md   ◀── facts you supply
  └──────────────────────────────────────────────────────────────────────────────
     │  report green / findings resolved
     ▼
  ┌─ ⑤ PRE-LAUNCH SWEEP  (ship gate) ───────────────────────────────────────────
  │  pre-launch-sweep · BUILD (THIN orchestrator)
  │  lint · typecheck · build · test  ── then DELEGATES ↓
  │      ├─▶ web-quality-skills · ADOPT (MIT)   perf·CWV·a11y·SEO·best-practices
  │      └─▶ knip / depcheck · Lighthouse CI / Unlighthouse   (dead code · perf)
  └──────────────────────────────────────────────────────────────────────────────
     │  go/no-go  +  accepted-exception log
     ▼
  ┌─ 🚀 SHIP ───────────────────────────────────────────────────────────────────
  └──────────────────────────────────────────────────────────────────────────────
     ┆  optional · only after you've done it by hand once
     ▼
  ┌─ ⑥ EXTRACT YOUR OWN skills  (advanced) ─────────────────────────────────────
  │  writing-skills · superpower
  │  distill YOUR proven method into a 2-layer skill
  │  (MIT licensing gate if you redistribute)
  └──────────────────────────────────────────────────────────────────────────────
```

> The **spine** (brainstorming → plan → execute → review → verify) isn't a one-time step — it wraps *every* station. Each station is "brainstorm the intent → plan it → do it → have it reviewed/verified."

---

## Facts vs. method — the split, per station

What you teach: the skill never holds your brand. It holds the *judgment*; you bring the *facts*.

```
  STATION                       METHOD (in the skill)                 FACTS (your project supplies)
  ─────────────────────────────────────────────────────────────────────────────────────────────────
  ② design-system-consistency   reconcile scale · choose a ratio   ·  your design.md + design-tokens.json
                                 inline→token rewrite rules            (anydesign captures these)
  ③ responsive-craft            design-fork patterns · audit logic ·  your components · your breakpoints
  ④ reviewers                   viewport discipline · phase taxonomy· your design-principles.md
  ⑤ pre-launch-sweep            the sequence · go/no-go judgment   ·  your perf budget · your exceptions
```

---

## Cheat-sheet (one row per station)

| # | Station | Skill(s) | Type | What the user runs | In → Out | Gate before moving on |
|---|---|---|---|---|---|---|
| ① | Frame & plan | brainstorming → writing-plans → executing-plans | 🧭 spine | Describe the drifty site; brainstorm scope **incl. semantic reframes**; write a plan | site + goals → a scoped plan | Plan names the *reframes*, not just bugs |
| ② | Capture & consolidate | **anydesign** → **design-system-consistency** | 🟢 adopt + 🟣 build | Run `anydesign` on the URL → `design.md`+tokens; then run `design-system-consistency` to reconcile & migrate | live site → `design-system.md` + tokens + code on tokens | grep finds **no** rogue inline/arbitrary type values; one scale |
| ③ | Responsive refinement | **responsive-craft** | 🟢 adopt | `/responsive-craft audit` (375/768/1024/1440); pick a **design fork** where a thing is *wrong* small, don't shrink | aligned code → tablet/mobile fixed + reframe decisions | no overflow · tap ≥44px · gutters kept · reframes chosen |
| ④ | Review gate | **mobile-reviewer** + **visual-reviewer** | 🔵 agents | Invoke the reviewer subagent against the running site; it reads your `design-principles.md` | running site → a review report | report green / findings resolved |
| ⑤ | Pre-launch sweep | **pre-launch-sweep** → **web-quality-skills** + knip/Lighthouse | 🟣 build + 🟢 adopt + ⚙️ | Run the sweep: it does lint/tsc/build/test, then delegates perf·a11y·SEO·dead-code | reviewed site → green checklist + exception log | every item passes **or** has a logged, accepted exception |
| ⑥ | Extract your own | **writing-skills** | 🧭 spine | After doing it by hand once, distill your repeatable method into your own 2-layer skill | your proven work → your own shareable skill | runs on a toy site with **no** facts leaking in |

---

## The three things people get wrong (teach these explicitly)

1. **"`frontend-design` already does this."** No — `frontend-design`, `brand-guidelines`, `theme-factory` are all *generative* (make new UI). They have **zero overlap** with auditing/consolidating an existing site. The design-system-consistency skill is the only thing that does the reconcile-and-rewrite job.
2. **Shrinking instead of reframing.** The headline mobile mistake. When a thing is *wrong* small (e.g. a wide demo crammed to ~375×187px on a phone), the move is to **re-crop / reframe** it for mobile — a different aspect, position, or source — not to scale the desktop frame down. That's what responsive-craft's "design forks" force you to consider.
3. **Bloating the pre-launch sweep.** It's a *thin orchestrator* — a sequence + a go/no-go + an exception log. The second you start baking perf/a11y rules into it, you've built a worse `web-quality-skills`. Delegate the audits; keep the judgment.

---

## Licensing gate (only matters if they redistribute)

Bundling/forking is safe **only for MIT** sources: `anydesign`, `responsive-craft`, `web-quality-skills`, `OneRedOak/design-review`, `accessibility-agents`. The two closest design-audit community skills (`claude-design-auditor-skill`, `website-audit-skill`) have **no license** — learn from them, never redistribute.
