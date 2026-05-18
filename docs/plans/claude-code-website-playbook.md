# Building Production Pages with Claude Code — A Playbook

A reusable workflow for AI-built landing pages that actually look right on mobile, follow a coherent design system, and self-verify their work. Applies to any of your website builds, not just Materials.

---

## The big idea

Three things have to be true for vibe-coded landing pages to come out polished:

1. **The agent knows the design language before it writes a line of code.** That goes in `CLAUDE.md` — voice, tokens, motion philosophy, mobile rule, banned patterns.
2. **The agent reviews its own output visually, at multiple breakpoints, before claiming the work is done.** That's a Playwright MCP loop with a dedicated reviewer subagent that has *no code access* — only browser tools. The constraint forces honest review.
3. **Mobile is checked first, every iteration.** Not as a final pass.

The rest of this doc translates those three principles into a concrete setup and copy-paste templates.

---

## Setup (one-time per project)

**Install Playwright MCP** in your project directory:

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

Verify with `/mcp` inside Claude Code — you should see `playwright` listed with tools like `browser_navigate`, `browser_take_screenshot`, `browser_resize`. The first time you ask Claude to use it in a session, say "use playwright mcp" explicitly — otherwise it sometimes tries to call Playwright via bash.

**Create `CLAUDE.md`** at project root (template below).

**Create `.claude/agents/`** at project root and drop in the `visual-reviewer.md` subagent definition (also below).

**Run a local dev server** on a known port. The reviewer subagent hits `localhost:PORT` to inspect work — without a running server it can't see anything.

---

## How the loop actually works

Each section/component goes through this four-step cycle. The main agent drives it; the reviewer subagent verifies it.

1. **Plan.** Main agent reads `CLAUDE.md` + the section spec, proposes the implementation approach in 5–10 lines. You approve or course-correct.
2. **Build.** Main agent writes the code, mobile-first — base styles target 375px, breakpoints add desktop treatments.
3. **Review.** Main agent invokes the `visual-reviewer` subagent with: dev server URL, breakpoints to test, design intent (1–2 paragraphs from the brief), and acceptance checklist. Reviewer takes screenshots at 375 and 1440 (plus any others called out), writes a `.md` report against the checklist.
4. **Iterate.** Main agent reads the report, fixes the issues, re-invokes the reviewer. Loop until the report says PASS at all required viewports.

The reviewer is intentionally restricted to browser + read/write tools. It *cannot edit code*. This means it has to write up exactly what's wrong clearly enough for the main agent to fix it — which is the right constraint for honest review. If the reviewer could edit, it'd "fix" things by working around them instead of flagging the underlying issue.

---

## Three concerns, three solutions

### 1. Design system — pre, post, or as you go?

The honest answer is **a small one upfront, expanded as you build**. Trying to pre-build a complete system before any pages exist is over-architecting; building the page first and trying to extract a system after produces inconsistent tokens. The middle path:

**Lock at the start (in `CLAUDE.md`):**
- Colour tokens (8–12 named values, no more)
- Type scale (5–6 sizes — display / h1 / h2 / h3 / lead / body / caps-mono)
- Spacing scale (Tailwind's default is fine — 0, 1, 2, 4, 6, 8, 12, 16, 24)
- One sans + one mono typeface
- Motion philosophy in one sentence
- Border / hairline rules (one or two weights, named)

**Let emerge during build (in `design-system.md` next to `CLAUDE.md`):**
- Pill buttons, element boxes, section eyebrows, card surfaces, etc.

The rule: when a pattern recurs in a *third* section, it gets promoted to a named primitive in `design-system.md`. Two recurrences = coincidence. Three = system. This stops you both from over-systematising on day one and from drifting into ad-hoc chaos by section 5.

For Materials specifically, the brand DNA (element-box system, bracket-framed eyebrows, dark cinematic palette) is established enough that it should go in `CLAUDE.md` upfront — the creative brief already has the tokens and primitives, just port them.

### 2. Playwright iteration loops

The subagent below is intentionally minimal. It has Playwright MCP tools and the Write tool (for writing reports), and nothing else. It cannot edit code. The design forces it to articulate what's wrong instead of patching it.

Save as `.claude/agents/visual-reviewer.md`:

```yaml
---
name: visual-reviewer
description: MUST BE USED after any UI build or change. Visually verifies work against design intent at multiple viewports. Does not edit code — writes a structured review report.
tools: mcp__playwright__browser_navigate, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_resize, mcp__playwright__browser_snapshot, mcp__playwright__browser_click, mcp__playwright__browser_console_messages, Read, Write
model: sonnet
---

You are a senior visual design reviewer. You verify that built UI matches design intent.

When invoked, you receive:
- A URL to review (typically localhost)
- A list of viewport widths to test (always include 375 mobile and 1440 desktop unless told otherwise)
- A design intent (1–2 paragraphs from the spec)
- An acceptance checklist (specific, testable items)

Process:
1. Resize the browser to the FIRST viewport — always mobile/375 first. This is non-negotiable.
2. Navigate to the URL
3. Take a screenshot
4. Take an accessibility snapshot
5. Walk the acceptance checklist item by item, marking PASS / FAIL / UNCLEAR
6. Note anything visually off that's NOT on the checklist (alignment, contrast, broken states, overflow)
7. Repeat at each remaining viewport
8. Check console for errors / warnings
9. Write a report at /tmp/review-{component}-{ISO-timestamp}.md and return the path

Report format:

# Review: {component}
URL: {url}
Date: {ISO date}

## Verdict
PASS | NEEDS_ITERATION | FAIL

## Mobile (375px)
- [ ] Item 1: PASS / FAIL — note
- [ ] Item 2: PASS / FAIL — note
...

## Desktop (1440px)
- [ ] Item 1: PASS / FAIL — note
...

## Console
{any errors / warnings, or "clean"}

## Out-of-scope observations
{anything visually off not on the checklist}

## Specific changes recommended
{actionable, code-level when possible — e.g. "card padding at mobile is 12px, intent was 22px gutters"}

Rules:
- Always test mobile FIRST. If mobile fails, mark the verdict NEEDS_ITERATION and don't bother walking desktop until mobile is fixed.
- Be specific. "Looks bad" is not a review. "The hero stat at 375px overflows the right edge by ~20px" is.
- Don't recommend redesigns. Recommend fixes.
- If you can't tell whether something is intentional, mark UNCLEAR and ask in the report.
- Never claim something passes that you didn't actually screenshot.
```

The "MUST BE USED" phrase in the description is deliberate — it tells the main agent to delegate to this subagent automatically after UI changes, not just when you remember to ask.

### 3. Mobile parity

Vibe-coded sites end up desktop-first because that's what the agent sees while writing code. Three rules together force parity. Each one alone fails — agents route around single rules. All three is harder to bypass.

**Rule 1 — Mobile-first in code.** Base classes target 375. Breakpoints add desktop. Encode this in `CLAUDE.md`:

> All components are written mobile-first. Base styles target 375×667. Use `sm:` / `md:` / `lg:` prefixes only to ADD desktop treatments, never to fix mobile.

**Rule 2 — Mobile review first, every iteration.** The visual-reviewer always tests 375 first. If mobile fails, desktop isn't even walked. This kills the "I'll fix mobile last" trap.

**Rule 3 — Mobile in the acceptance checklist for every component.** Any iteration prompt has to include at least one mobile-specific check. Examples:
- Tap targets ≥44px
- Primary CTA visible above the fold at 375×667 without scrolling
- No horizontal scroll
- Text doesn't break or overflow
- Section eyebrow + headline + first paragraph visible together at 375

You can keep a running list in `CLAUDE.md` and reference it in every section prompt.

---

## Templates you can copy

### `CLAUDE.md` template (project root)

```markdown
# Project: {name}

## Brand & voice
{paste from your creative brief — voice rules, banned words, tone, who the buyer is}

## Design tokens
**Typefaces**
- Sans: {typeface, weights}
- Mono: {typeface, weights}

**Palette**
- --paper: {hex} (default bg)
- --paper-2: {hex} (alt sections)
- --ink: {hex} (primary text, primary buttons)
- --ink-2: {hex} (body)
- --ink-3: {hex} (captions, mono labels)
- --line: {hex} (card borders)
- --line-2: {hex} (subtle dividers)
{plus glow/accent tokens if applicable}

**Type scale**
- display / h1 / h2 / h3 / lead / body / caps-mono — sizes here, with mobile variants

**Spacing**
Tailwind default. Page gutters: 22px mobile / 64px desktop.

**Radius / hairlines**
Three weights, named. {specifics}

## Visual primitives
- **Eyebrow**: bracket-framed mono caps, e.g. `[ 01 — SECTION NAME ]`
- **Pill button**: thin border, mono caps, trailing ↗ for outbound/secondary actions; filled for primary CTAs
- {others as they're locked — keep this short, link out to design-system.md when it grows past ~5 items}

## Motion philosophy
Two motion-heavy moments per page max. The rest is calm. Name the two motion moments up front per page; everything else is subtle entry transitions and hover states.

## MOBILE RULE (NON-NEGOTIABLE)
Every component is built mobile-first. Base styles target 375×667. Breakpoints ADD desktop, they don't fix mobile. Every iteration is reviewed at 375 FIRST; if mobile fails, the build fails — desktop isn't even checked.

## Standing mobile checks (apply to every component)
- Tap targets ≥44px
- No horizontal scroll
- Primary CTA visible above the fold at 375×667
- Text doesn't break / overflow
- 22px gutters preserved

## Verification protocol
After ANY UI build or change, invoke the `visual-reviewer` subagent before claiming the work is done. Reviewer report must be PASS at all required viewports. No exceptions.

## What NOT to do
- No localStorage / sessionStorage in components (env constraint)
- Don't extend the colour palette without asking
- Don't add motion for ambience without a reason
- Don't replace mono with sans for "readability" — mono usage is strict (see voice doc)
- {project-specific bans}

## File map
- `materials-hifi-creative-brief.md` — section-level creative brief
- `design-system.md` — emerging primitives (start near-empty, grow as patterns recur 3×)
- `.claude/agents/visual-reviewer.md` — the reviewer subagent
- Dev server: http://localhost:3000
```

### Initial build prompt template

```
Build section {N} of {project} per the creative brief at `{brief-filename}.md`.

Section: {paste the section block from the brief — job + chosen direction}

Acceptance criteria:
1. {specific, testable}
2. {specific, testable}
3. Mobile (375×667): {specific mobile criteria — at least one beyond the standing checks in CLAUDE.md}
4. Desktop (1440px): {specific desktop criteria}
5. No console errors or warnings
6. `prefers-reduced-motion` fallback for any motion-driven element

After building:
1. Confirm dev server is running
2. Invoke the visual-reviewer subagent with:
   - URL: http://localhost:3000{path}
   - Viewports: [375, 1440]
   - Design intent: {paste 1–2 paragraphs from the brief}
   - Acceptance criteria: {the list above}
3. If the report is FAIL or NEEDS_ITERATION, fix the issues and re-invoke. Loop until PASS at both viewports.
4. If a visual primitive recurred for the third time during this build, document it in design-system.md.
```

### Iteration prompt template (after a review report)

```
The visual-reviewer reported issues on {section}. Report at {path}.

Read the report. For each FAIL or NEEDS_ITERATION item:
1. Identify the root cause (don't just patch the symptom)
2. Make the fix
3. If the fix touches a token or primitive, update design-system.md

When all items are addressed, re-invoke the visual-reviewer with the same brief.

Don't claim done until the new report is PASS at all required viewports — including mobile FIRST.
```

---

## What NOT to do

- **Don't proliferate subagents.** One focused reviewer is enough for landing pages. Some teams build 5+ subagents (PM, architect, implementer, tester) — that's right for large codebases, overkill for a single page. Custom subagents gatekeep context — the more you have, the more your main agent has to coordinate. Keep most context in `CLAUDE.md` and let the main agent orchestrate.
- **Don't skip the dev server.** Static HTML inspection misses everything that matters (responsive behaviour, motion, hover states, console errors). The reviewer needs a running browser.
- **Don't let the agent self-review without the subagent.** It will rationalise. The constraint of a separate-context reviewer with no code access is the whole point.
- **Don't add desktop screenshots and call it "responsive review."** 375 first, every time.
- **Don't extend the design system on the fly.** New tokens, new primitives, new patterns get an explicit decision — either approved into `design-system.md` or rejected. Drift kills coherence faster than anything else.
- **Don't trust an agent's "looks great!" without screenshots.** If you can't see the screenshot, the review didn't happen.

---

## What this workflow doesn't solve

- **Animation polish.** Playwright takes static screenshots. Subtle motion issues (easing curves, stagger timing, perceived weight) still need your eye. For motion-heavy sections, plan for one human pass after the loop is done.
- **Real device testing.** 375px in a desktop browser is not the same as iOS Safari at 375. Plan a real-device pass before launch — touch behaviour, momentum scrolling, font rendering all differ.
- **Production performance.** The reviewer flags console warnings, but Lighthouse, bundle size, image optimisation are separate concerns. Run them in a final pass.
- **Copy-level review.** The visual reviewer checks layout and visual fidelity, not whether the headline lands. Keep that loop with you (or set up a separate copy-reviewer subagent if it earns its place — third recurrence rule applies to subagents too).

---

## Extending this later

If the build outgrows this single-reviewer setup, the pattern for adding subagents is:

1. **Earn its place by recurrence.** If you find yourself doing the same review/check three times manually, *then* spin up a subagent for it. Not before.
2. **Restrict its tools aggressively.** Each subagent should have the minimum tool set for its job. The reviewer has browser + write. A copy reviewer would have read + write. An accessibility auditor would have browser + write.
3. **Keep CLAUDE.md as the canon.** Subagent system prompts reference it; they don't restate it. When the canon changes, every subagent inherits the change.

Plausible additions, in rough order of usefulness for landing-page work:

- **`copy-reviewer`** — reads the rendered page and checks against the brief's voice rules and banned-word list. Useful once you're building multiple pages.
- **`accessibility-auditor`** — runs a structured a11y pass (contrast, ARIA, keyboard, focus order). Worth it before launch.
- **`design-token-enforcer`** — diffs the codebase against `design-system.md` and flags rogue values. Worth it for multi-page sites.

But: until you've felt the pain of *not* having one of these, don't add it. The single-reviewer + strong CLAUDE.md setup carries you a long way.
