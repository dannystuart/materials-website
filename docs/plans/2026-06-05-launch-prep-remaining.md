# Launch Prep — Remaining Items (fresh-session plan)

_Created 2026-06-05 · Branch: `feat/design-system-foundation`_

**Purpose.** A self-contained execution plan for the launch items NOT yet done, written so a
new session can pick them up with zero prior context. The exhaustive punch-list lives in
[`2026-06-04-launch-checklist.md`](./2026-06-04-launch-checklist.md); _this_ doc is the plan for
the slice that's still open, plus the state you need to start.

---

## State you're inheriting (already shipped, verified green)

Done in the prior session on this branch — build ✓, 26 tests ✓, lint ✓ (one pre-existing
`RecipeCarousel` exhaustive-deps warning, unrelated):

- **Primary CTA fixed** — floating "Buy" now → Gumroad Edition 1 (`FloatingCta.tsx` + its test).
- **Metadata** — full `metadata` + `viewport` in `src/app/layout.tsx`: `metadataBase`, title +
  template, description, canonical, robots directives, Open Graph, Twitter `summary_large_image`,
  `theme-color #010100`, `color-scheme dark`.
- **Canonical origin** — `src/lib/site.ts` exports `SITE_URL` (`process.env.NEXT_PUBLIC_SITE_URL`
  ?? `https://vanta.supply`) and `SITE_NAME` (`Materials¹`). **Use these constants everywhere** —
  don't hardcode the domain.
- **SEO routes** — `src/app/robots.ts`, `src/app/sitemap.ts` (both → `vanta.supply`).
- **Icons** — `src/app/icon.svg` (hand-authored, on-brand), `src/app/apple-icon.tsx` (180²,
  generated), plus the retained `favicon.ico`.
- **Social card** — `src/app/opengraph-image.tsx` (1200×630). ⚠️ **PLACEHOLDER** — Dan is
  designing the real banner. To swap: delete the `.tsx`, drop in `src/app/opengraph-image.png`
  (Next auto-wires it; no metadata change).
- **Fallback pages** — `src/app/not-found.tsx` (branded 404), `src/app/error.tsx` (client error
  boundary). Copy approved.
- **`next.config.ts`** — AVIF/WebP image formats + site-wide security headers (HSTS,
  `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`).
  **CSP intentionally omitted** — there's a `// TODO` in the headers array (see "Security" below).
- `.gitignore` already excludes `.DS_Store` and `public/videos/*.mov` masters.

### Carried decisions / loose ends to verify
- **`og:site_name = "Materials¹"`** (product-forward). If "Vanta Supply" becomes the umbrella
  brand across multiple editions, move site_name → "Vanta Supply" and keep the product in the
  title. Lives in `src/lib/site.ts` (`SITE_NAME`).
- **`twitter:creator = "@dannystuart"`** — **verify this is the real X handle** (footer uses the
  Threads handle). In `layout.tsx`. Drop the tag if there's no X presence.
- **OG image is a placeholder** — must be replaced with Dan's designed banner before launch.

---

## Working constraints (read before writing code)

- **Next.js 16 — APIs differ from older versions.** Per `AGENTS.md`: read the relevant guide in
  `node_modules/next/dist/docs/` before writing any route/config/metadata code.
- **Brand voice** — designer-to-designer, warm, casual. **Banned words** (no exceptions): unlock,
  elevate, supercharge, transform, seamlessly, effortlessly, robust, powerful, comprehensive,
  breathtaking, game-changing, revolutionary, level up, next-level, cutting-edge, next-gen.
  "stunning"/"curated" only in quoted testimonials. Don't lead with "AI-powered".
- **Tokens** — bg `#010100`; white ink ladder (70/55/45/35/8%); single bottom-anchored blue glow;
  Plus Jakarta Sans (`font-display`); full system of record in `design-system.md`.
- **Desktop-led** — 1440 is primary; mobile (375) ships same-iteration. Mobile changes →
  run the `mobile-reviewer` subagent. Desktop is Dan's gate.
- **Verify pattern** — dev server runs at `:3000`. Smoke-test rendered output with
  `curl -s localhost:3000/<route>` (worked well for robots/sitemap/head tags last session).
- **Context budget** — prefer subagent-driven work; keep the main thread lean.

---

## Session A status (done 2026-06-05) — A + B + D

Build ✓ · 26 tests ✓ · lint ✓ (only the pre-existing `RecipeCarousel` exhaustive-deps warning).

- **A (Analytics) — DONE.** `@vercel/analytics@2.0.1` + `@vercel/speed-insights@2.0.0` installed;
  `<Analytics />` + `<SpeedInsights />` in `layout.tsx` `<body>`. Verified they no-op locally
  (no `/_vercel/` injection in dev) — activate on the Vercel preview. `track("buy_click", {source:"floating-cta"})`
  wired on the floating Buy CTA.
- **B (JSON-LD) — DONE.** New `src/components/JsonLd.tsx` (server component) rendered home-only from
  `page.tsx`. Single `@graph`: Organization → WebSite → Product. Offer (`9.00`/`USD`/`InStock` + Gumroad
  URL) read from `packData`; names/URLs from `site.ts`; product `description` from new `SITE_DESCRIPTION`
  (site.ts) shared with the meta description. ⚠️ **`aggregateRating` (5.0 / 8) is mirrored from the §05
  card** — keep only if those are genuine Gumroad reviews (Google review-snippet policy); else remove from
  both the card and the JSON-LD. _Still needs:_ Rich Results Test on the deployed URL (H).
- **D (Accessibility) — structural items DONE:** skip-to-content link (first focusable, reveals on focus)
  + `id="main-content"` on `<main>`; `<footer>` moved out of `<main>` → top-level `contentinfo`; footer-link
  focus ring (replaced an imperceptible 85→100% shift). Audit confirmed clean: one `<h1>`, no skipped
  levels, alt-text coverage, all controls focusable + named, reduced-motion fallbacks across hero/§02/§04/§05/footer.
  - **Contrast — DECISION (Dan, 2026-06-05): fix worst offenders only.** Footer "VANTA SUPPLY" (was 35%,
    2.7:1) and the §04 mobile "Swipe to see the result" hint (was 45%, 16px) bumped to **55%** (≈6.2:1, clears AA).
    The 11–12px §02–§06 eyebrows + "Verified Buyer" + hero "VANTA SUPPLY" **intentionally left at 45%** as
    decorative metadata. **Consequence:** axe/Lighthouse will still flag those eyebrows, so the automated
    a11y score lands ~93 (under the 95 target) **by design** — this is a conscious aesthetics-over-metric call,
    not a regression.
  - _Still open in D (deploy/manual, not blockers):_ Lighthouse/axe run on a prod build; VoiceOver SR sweep.
    Nice-to-haves deferred: FAQ `aria-expanded` (native `<details>` is acceptable), `aria-hidden` the footer
    wordmark repeats, §03 inactive-plate mouse-only `div onClick` (keyboard path already exists via the pills).
  - _Note:_ full `mobile-reviewer` not run — the only mobile change was an opacity bump (no layout impact).

## Remaining workstreams (prioritized)

### A. Analytics & real-user vitals  ·  _quick, do first_
Goal: production traffic + Core Web Vitals visibility, cookieless (no consent banner needed).
- [ ] `pnpm add @vercel/analytics @vercel/speed-insights`.
- [ ] In `src/app/layout.tsx` `<body>`, render `<Analytics />` (from `@vercel/analytics/next` /
      `/react` — check the current import path in the package) and `<SpeedInsights />`.
- [ ] Confirm they no-op outside Vercel (they do) so local/dev is unaffected.
- [ ] Optional: a `track()` event on the floating-CTA Buy click for conversion attribution
      (UTM is already on the Gumroad links).
- Accept: build green; both scripts load on the deployed preview; events show in Vercel dashboard.

### B. Structured data (JSON-LD)  ·  _quick, high SEO value_
Goal: rich-result eligibility; clarify publisher + product to crawlers.
- [ ] Add a JSON-LD `<script type="application/ld+json">` (server component) — `Organization`
      (or `Brand`) + `WebSite`, and a `Product` with `offers` (price `9.00`, `priceCurrency`
      `USD`, `availability`, `url` = Gumroad Edition 1). Pull price/links from
      `src/components/section-05/packData.ts` so they don't drift.
- [ ] Keep it in `layout.tsx` or a small `JsonLd` component; build URLs from `SITE_URL`.
- Accept: passes Google Rich Results Test on the deployed URL; no console errors.

### C. Performance & page-load  ·  _biggest measurable win_
Goal: fast LCP, low CLS/INP, lean bundle. (three.js + GSAP are heavy.)
- [ ] **Lighthouse pass** (mobile + desktop) on a production build (`pnpm build && pnpm start`),
      and one throttled WebPageTest. Record baseline scores in this doc.
- [ ] **Bundle analysis** — add `@next/bundle-analyzer`; confirm three.js/R3F is code-split and
      not in the hero's critical path. `dynamic()` below-the-fold R3F/heavy sections.
- [ ] **Tracked asset weight** (needs Dan's input — don't blind-delete):
      `public/videos/macbook-demo.mp4` is **41 MB** and *is* referenced — confirm whether the
      full-res or the `-720` variant is actually used (`MacbookDemo.tsx`), keep only what ships.
      PNGs `example-1.png`/`example-2.png` are ~3 MB each; route large images through `next/image`
      (AVIF/WebP) or pre-compress. `public/materials-grid.jpg` had **0 references** — candidate
      to remove.
- [ ] **CWV specifics** — hero poster is the LCP element (keep it small + prioritized); reserve
      aspect-ratio on every video/image to hold CLS < 0.1; below-fold videos `preload="none"`.
- [ ] Re-verify the WebGL live-context count (recent work suspends contexts in `display:none`).
- Accept: Lighthouse ≥ 90 (Perf/SEO/Best-Practices/A11y) mobile; LCP < 2.5s, CLS < 0.1, INP < 200ms.

### D. Accessibility  ·  _do before launch_
Goal: WCAG AA, full keyboard + screen-reader operability.
- [ ] **Contrast audit** of the ink-ladder rungs on `#010100` — `muted 45%` / `faint 35%` will
      likely fail AA for body text; restrict them to large/decorative use or bump the rung.
- [ ] **Keyboard pass** — tab the whole page: CTA, all links, §06 FAQ accordions, §05 pack cards.
      Visible focus rings, logical order, no traps.
- [ ] **Skip-to-content link** as the first focusable element.
- [ ] **Heading order** — one `<h1>`, no skipped levels.
- [ ] **Alt text** on meaningful images; decorative element boxes stay `aria-hidden`.
- [ ] **`prefers-reduced-motion`** — verify fallbacks on hero, §02 carousel, §04 recipe, §05
      macbook, footer.
- [ ] **Screen-reader sweep** (VoiceOver) + run the `mobile-reviewer` if any mobile markup changes.
- Accept: axe/Lighthouse a11y ≥ 95; manual keyboard + SR pass with no blockers.

### E. PWA manifest + full icon set  ·  _low priority for a landing page_
- [ ] `src/app/manifest.ts` (`MetadataRoute.Manifest`) — `name` "Materials¹", `short_name`,
      `theme_color`/`background_color` `#010100`, `display: "standalone"`, and 192 + 512 (+ maskable)
      icons. Needs raster PNG icons (generate via `icon.tsx` sizes or export from the designed art).
- Accept: `/manifest.webmanifest` validates; installable prompt shows correct name/icon.

### F. Legal / trust  ·  _confirm scope with Dan_
- [ ] Lightweight privacy note (email is collected via `mailto:`, store links out to Gumroad).
      Vercel Analytics is cookieless → likely **no cookie banner needed**; confirm before adding one.
- [ ] Footer copyright year current; `hi@dannystuart.com` live.

### G. Vercel deploy & infrastructure
- [ ] Project linked; **custom domain `vanta.supply`** attached, DNS propagated, HTTPS active.
- [ ] **Canonical host** — pick `www` vs apex and 301 the other (matches `metadataBase`).
- [ ] Set `NEXT_PUBLIC_SITE_URL` in Production env (and leave previews to auto-fallback or set per-env).
- [ ] **Remove deployment protection / password** before launch (it blocks crawlers + unfurls).
- [ ] Verify the security headers land on the deployed response (`curl -I`); decide on CSP
      (the `// TODO` in `next.config.ts`) — needs testing against the inline scroll-restore
      `<script>` in `layout.tsx` + R3F/GSAP + Analytics. Use a hash/nonce for the inline script
      if you add CSP.
- Accept: production domain serves over HTTPS with headers; preview smoke-test passes.

### H. Pre-flight (launch morning)  ·  _from checklist §11_
- [ ] **Replace placeholder OG image** with the designed banner.
- [ ] Social unfurl verified on X / LinkedIn / Slack / iMessage (production URL).
- [ ] Rich Results Test passes for the JSON-LD.
- [ ] **Google Search Console** — verify ownership, submit `sitemap.xml`.
- [ ] Real-device check (one iOS Safari, one Android Chrome).
- [ ] All CTAs land on live, purchasable Gumroad listings.
- [ ] Final `pnpm build` clean; promote to production; smoke-test the live domain.

---

## Suggested session batching
1. **Session A (no deps): A + B + D** — analytics, JSON-LD, accessibility. Independent of Dan's
   pending assets/decisions; all verifiable locally.
2. **Session B: C** — performance pass (needs Dan's call on the video assets).
3. **Session C: G + F + E** — Vercel infra, legal, optional PWA — once the domain is ready.
4. **Launch morning: H** — pre-flight ritual (incl. swapping in the real OG banner).

## Pointers
- Full enumerated checklist: `docs/plans/2026-06-04-launch-checklist.md`
- Creative brief (voice/aesthetic source of truth): `docs/plans/materials-hifi-creative-brief.md`
- Design tokens: `design-system.md` (repo root)
- Origin/brand constants: `src/lib/site.ts`
