# Launch Prep — Session A Report (Analytics · JSON-LD · Accessibility)

_Completed 2026-06-05 · Branch: `feat/design-system-foundation` · Not committed (per instruction)_

**Scope.** Session A of [`2026-06-05-launch-prep-remaining.md`](./2026-06-05-launch-prep-remaining.md):
workstreams **A** (Vercel Analytics + Speed Insights), **B** (JSON-LD structured data), and
**D** (accessibility pass). These three were chosen because they have no external dependencies
and are fully verifiable locally.

**Quality gate (final): build ✓ · 26/26 tests ✓ · lint ✓** (only the pre-existing
`RecipeCarousel` exhaustive-deps warning, unrelated to this work).

---

## TL;DR

| Item | Status | Notes |
|---|---|---|
| A — Analytics + Speed Insights | ✅ Done | Render in `<body>`; no-op locally, activate on Vercel |
| A — `track()` on Buy CTA | ✅ Done | `buy_click` event w/ `source: "floating-cta"` |
| B — JSON-LD (Org + WebSite + Product) | ✅ Done | Home-only; offer reads from `packData` |
| D — Skip link + `#main-content` | ✅ Done | Verified it reveals on keyboard focus |
| D — `<footer>` → top-level landmark | ✅ Done | Moved out of `<main>` |
| D — Footer link focus ring | ✅ Done | Replaced an imperceptible focus state |
| D — Contrast (worst offenders) | ✅ Done | Per Dan's decision — see §3.3 |
| D — Eyebrow contrast (45%) | ⏸️ Left by choice | a11y score ~93 by design — see §3.3 |
| D — Lighthouse/axe, VoiceOver | ⤴️ Deferred | Needs prod build / deploy (Session C) |

---

## 1. Workstream A — Analytics & real-user vitals

**Goal.** Production traffic + Core Web Vitals visibility, cookieless (no consent banner).

### What changed
- Installed `@vercel/analytics@2.0.1` and `@vercel/speed-insights@2.0.0` (`pnpm add`).
- `src/app/layout.tsx` — imported from the App-Router entry points and rendered both at the end
  of `<body>`:
  ```tsx
  import { Analytics } from "@vercel/analytics/next";
  import { SpeedInsights } from "@vercel/speed-insights/next";
  // …
  <body className="min-h-full">
    {/* skip link */}
    {children}
    <Analytics />
    <SpeedInsights />
  </body>
  ```
  (Import path confirmed against each package's `exports` map — both ship a `./next` entry.)
- `src/components/floating-cta/FloatingCta.tsx` — conversion event on the primary CTA:
  ```tsx
  import { track } from "@vercel/analytics";
  // …on the Buy <a>:
  onClick={() => track("buy_click", { source: "floating-cta" })}
  ```
  UTM params are already on the Gumroad link, so this adds in-Vercel custom-event attribution
  on top of Gumroad's own.

### Why it's safe locally
Both components no-op outside Vercel. Confirmed by curling the dev server: **no `/_vercel/insights`
or `/_vercel/speed-insights` script is injected** in development. They'll begin reporting on the
deployed preview/production.

### Accept criteria
- [x] Build green.
- [x] Confirmed no-op in dev.
- [ ] Scripts load on the deployed preview / events show in the Vercel dashboard _(verify post-deploy)._

---

## 2. Workstream B — Structured data (JSON-LD)

**Goal.** Rich-result eligibility; clarify publisher + product to crawlers.

### What changed
- New **`src/components/JsonLd.tsx`** — a server component that renders a native
  `<script type="application/ld+json">`. Rendered **home-only** from `src/app/page.tsx` (so it
  doesn't leak onto `/404` / error routes).
- New export **`SITE_DESCRIPTION`** in `src/lib/site.ts` — single source for both the page meta
  description (`layout.tsx`) and the JSON-LD product description, so the two can't drift.
- Followed the Next.js 16 JSON-LD guide (`node_modules/next/dist/docs/01-app/02-guides/json-ld.md`):
  a native `<script>` (not `next/script`), with `<` escaped to `<` to keep the serialized
  payload XSS-safe.

### Data sourcing (drift-proof)
- **Price + offer URL** read from `src/components/section-05/packData.ts` (`PAID_PACK`) — the same
  source the §05 card renders from. `"$9"` → `"9.00"` is derived, so a price change in the card
  flows through automatically.
- **Names / URLs** from `src/lib/site.ts` (`SITE_NAME`, `SITE_URL`).
- **Description** from `SITE_DESCRIPTION`.

### The graph (a single `@graph`, tied by `@id`)
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://vanta.supply/#organization",
      "name": "Materials¹",
      "url": "https://vanta.supply",
      "logo": { "@type": "ImageObject", "url": "https://vanta.supply/icon.svg" },
      "founder": { "@type": "Person", "name": "Danny Stuart", "url": "https://dannystuart.com" }
    },
    {
      "@type": "WebSite",
      "@id": "https://vanta.supply/#website",
      "name": "Materials¹",
      "url": "https://vanta.supply",
      "description": "160 abstract Materials — …",
      "inLanguage": "en-US",
      "publisher": { "@id": "https://vanta.supply/#organization" }
    },
    {
      "@type": "Product",
      "@id": "https://vanta.supply/#product",
      "name": "Materials¹ — Edition 01",
      "description": "160 abstract Materials — …",
      "url": "https://vanta.supply",
      "image": "https://vanta.supply/opengraph-image",
      "brand": { "@id": "https://vanta.supply/#organization" },
      "offers": {
        "@type": "Offer",
        "price": "9.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://dannystuart.gumroad.com/l/Materials-Edition-1?utm_source=…"
      },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": 5, "reviewCount": 8 }
    }
  ]
}
```

### Design decisions
- **Organization name = `Materials¹`** (mirrors the existing `og:site_name` / `applicationName`),
  with **Danny Stuart as `founder`**. This keeps structured data aligned with the current
  product-forward brand stance and does **not** pre-commit the deferred "Vanta Supply umbrella"
  decision (that decision was specifically about `og:site_name`).
- **Product `image`** points at the OG route (`/opengraph-image`, 1200×630). It auto-updates when
  the real banner is dropped in — no JSON-LD change needed.

### ⚠️ Open flag — `aggregateRating`
`5.0 / 8 reviews` is **mirrored from what the §05 card already displays**. JSON-LD must match
visible content, so mirroring is the consistent choice — **but** Google's review-snippet policy
requires these be genuine reviews. **Keep only if the rating is real; otherwise remove it from
both the card and the JSON-LD.** One-line removal if needed.

### Accept criteria
- [x] No console errors; payload parses as valid JSON.
- [ ] Passes Google Rich Results Test on the deployed URL _(needs a public URL — launch-morning)._

> Note: the Offer omits `priceValidUntil` / `hasMerchantReturnPolicy` / `shippingDetails`. Those
> are *merchant-listing* enhancements — the Rich Results Test may show them as **warnings**, not
> errors. The Product snippet still validates. Add them later only if pursuing merchant listings.

---

## 3. Workstream D — Accessibility

A full read-only audit was run first (10 dimensions: heading order, skip link, landmarks, images/alt,
interactive controls, focus visibility, reduced motion, contrast, forms, language/misc). Below is
what the audit found and what was done about each.

### 3.1 Fixed this session

| Fix | File(s) | Detail |
|---|---|---|
| **Skip-to-content link** | `layout.tsx` | First focusable element; `sr-only` → `focus-visible:not-sr-only` (verified the utilities compile and it reveals on focus). On-brand: white pill, blue focus ring. |
| **`id="main-content"`** | `page.tsx` | Skip-link target on `<main>`. |
| **`<footer>` → `contentinfo`** | `page.tsx` | Moved `<Footer />` **out of `<main>`** so the `<footer>` is a top-level landmark (was nested, scoping it out of the page's contentinfo). |
| **Footer link focus ring** | `footer/FooterPill.tsx` | The only focus indicator was an imperceptible `text-white/85 → text-white` shift. Added a visible `focus-visible` ring (atmosphere blue) + `rounded`. |

### 3.2 Audit confirmed clean (no action needed)
- **Heading order** — exactly one `<h1>` (hero); §02–§06 are `<h2>`; §05 pack titles `<h3>`; no
  skipped levels. `error.tsx` / `not-found.tsx` each have their own single `<h1>` (separate routes).
- **Images / alt** — all raster is `next/image` or `<video>` (no raw `<img>`). Meaningful images
  carry alt; decorative plates/halos/element-boxes/grid-lines/videos are `aria-hidden` /
  `role="presentation"`. No gaps.
- **Interactive controls** — every control is a real focusable `<button>`/`<a>` with an accessible
  name (floating CTA, §05 CTAs, §05 demo play/replay, §03 plate pills with `aria-pressed`, footer
  links, FAQ). FAQ uses native `<details>`/`<summary>` (keyboard-operable by default).
- **Focus visibility** — `cta-focus-ring` (globals.css) gives CTAs/FAQ a real 2-ring box-shadow;
  §03 plate pills and error/404 buttons have visible rings. (Footer links were the one gap → fixed.)
- **Reduced motion** — verified static fallbacks across hero, §02 carousel (+ R3F orbits shader
  freeze), §03 plate stack, §04 recipe **and the R3F carousel** (`useRecipeDemo` returns a frozen
  `activeIndex: 0` when `reducedMotion` — confirmed), §05 macbook demo + pack halo, and the
  **footer scrub** (`useFooterVideoScrub` early-returns after seeding the middle frame — confirmed).
  globals.css also has belt-and-suspenders `@media (prefers-reduced-motion: reduce)` blocks.
- **Forms** — none (sales via external Gumroad links; one `mailto:` with visible text). No labelling
  obligations.
- **Language / misc** — `<html lang="en">` set; no positive `tabindex`; `role` usage all legitimate
  (`role="img"` on star ratings with `aria-label`, `role="group"` on the plate toolbar).

### 3.3 Contrast — DECISION (Dan, 2026-06-05): **fix worst offenders only**

The dim ink-ladder rungs fail WCAG AA as **small text** on `#010100`. The decision was to fix the
worst offenders and keep the dimmest eyebrows as intentional decorative metadata.

| Element | File | Before | After | Contrast |
|---|---|---|---|---|
| Footer "VANTA SUPPLY" (desktop) | `footer/FooterDesktop.tsx` | `text-white/35` (~2.7:1) | `text-white/55` | ~6.2:1 ✅ |
| Footer "VANTA SUPPLY" (mobile) | `footer/FooterMobile.tsx` | `text-white/35` (~2.7:1) | `text-white/55` | ~6.2:1 ✅ |
| §04 "Swipe to see the result" (16px) | `section-04/SectionRecipeMobile.tsx` | `text-white/45` (~4.3:1) | `text-white/55` | ~6.2:1 ✅ |

**Intentionally left at 45%** (decorative metadata, per the decision): the 11–12px §02–§06 eyebrows,
the "Verified Buyer" labels, and the hero "VANTA SUPPLY".

**Consequence (by design):** axe/Lighthouse will still flag those 45% eyebrows, so the automated
a11y score is expected to land **~93, under the 95 target**. This is a conscious
aesthetics-over-metric call, **not a regression**. If a hard ≥95 is later required, bumping the
eyebrow rung 45% → 55% clears it (one rung up, ~6.2:1).

### 3.4 Deferred (non-blocking)
- **Deploy/manual:** Lighthouse + axe on a production build; VoiceOver screen-reader sweep. (Session C.)
- **Nice-to-haves not done:** FAQ `aria-expanded` (native `<details>` is acceptable — would need a
  client hook to mirror `open`); `aria-hidden` the footer wordmark repeats (reduces SR noise); §03
  inactive plate cards are a mouse-only `div onClick` (keyboard path already exists via the pills, so
  not a blocker).

### 3.5 Note on the mobile-reviewer
The project convention runs `mobile-reviewer` after mobile rework. The only mobile change here was a
**45→55% opacity nudge** (FooterMobile, SectionRecipeMobile) with **zero layout impact**, so the full
reviewer pass was skipped as disproportionate. Output was self-verified via curl (see §4). Trigger
the reviewer if you'd prefer the gate stamped.

---

## 4. Verification evidence

**Gates**
```
build:  Next.js 16.2.6 — Compiled ✓, TypeScript ✓, 9 static routes prerendered
test:   7 files, 26/26 passed
lint:   0 errors, 1 warning (pre-existing RecipeCarousel exhaustive-deps)
```

**Rendered-output smoke tests** (`curl` against the `:3000` dev server)
- Skip link present (`Skip to content`) and `id="main-content"` present.
- JSON-LD block parses as valid JSON with the full Org/WebSite/Product graph and `price: "9.00"`.
- No `/_vercel/*` script injected in dev (confirms analytics no-op locally).
- `.sr-only` rule + the `not-sr-only` reveal rule confirmed in the compiled CSS.
- Contrast classes confirmed: footer "VANTA SUPPLY" renders `text-white/55` ×2 (hero stays
  `text-white/45` ×2, as intended); §04 swipe hint renders `t-body … text-white/55`.

---

## 5. Files changed

**New**
- `src/components/JsonLd.tsx`
- `docs/plans/2026-06-05-session-a-report.md` (this file)

**Edited**
- `package.json` + `pnpm-lock.yaml` — `@vercel/analytics`, `@vercel/speed-insights`
- `src/lib/site.ts` — `SITE_DESCRIPTION`
- `src/app/layout.tsx` — analytics components, skip link, `SITE_DESCRIPTION`
- `src/app/page.tsx` — `<JsonLd />`, `id="main-content"`, `<Footer />` out of `<main>`
- `src/components/floating-cta/FloatingCta.tsx` — `track("buy_click")`
- `src/components/footer/FooterPill.tsx` — focus ring
- `src/components/footer/FooterDesktop.tsx` — "VANTA SUPPLY" 35→55%
- `src/components/footer/FooterMobile.tsx` — "VANTA SUPPLY" 35→55%
- `src/components/section-04/SectionRecipeMobile.tsx` — swipe hint 45→55%
- `docs/plans/2026-06-05-launch-prep-remaining.md` — Session A status block

---

## 6. Open items / decisions for Dan

1. **`aggregateRating`** — confirm the 5.0 / 8 reviews are genuine, or I'll remove it from the
   JSON-LD (and it should then come off the §05 card too). (§2)
2. **a11y score ~93 by design** — confirm you're happy holding the eyebrow aesthetic over a hard
   ≥95; the one-rung bump is available if you change your mind. (§3.3)
3. **Run `mobile-reviewer`?** — optional, given the change was opacity-only. (§3.5)
4. **Commit** — nothing committed yet; say the word.

## 7. What's next (from the launch-prep plan)
- **Session B** — performance pass (needs your call on the 41 MB `macbook-demo.mp4` + large PNGs).
- **Session C** — Vercel infra, legal/privacy, optional PWA manifest (once the domain's ready).
- **Launch morning** — swap the real OG banner, Rich Results Test, Search Console, real-device check.
