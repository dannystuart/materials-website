# Materials¹ — Pre-Launch Checklist

_Date: 2026-06-04 · Branch: `feat/design-system-foundation` · Single home page, Next.js 16 App Router, Vercel._

Status legend: ✅ done · ⚠️ partial / needs work · ❌ missing · 🔴 launch-blocker

This list was generated against the actual repo state, not a generic template. Items with a
`→ file` pointer have a concrete place to make the change.

---

## 0. Launch blockers (fix before anything else)

- [ ] 🔴 **Dead primary CTA.** The floating "Buy" button links to `#buy`, but no `id="buy"`
      exists on the page — it scrolls nowhere. Decide the target and wire it.
      → `src/components/floating-cta/FloatingCta.tsx:87`
      Options: (a) add `id="buy"` to the §05 close/packs section and let it scroll there, or
      (b) point it straight at the Gumroad URL in `src/components/section-05/packData.ts:46`.
      Also update the test `FloatingCta.test.tsx` which currently asserts `href="#buy"`.
- [ ] 🔴 **Verify every purchase link resolves.** Open each Gumroad link in `packData.ts`
      (Materials Edition 1, Dark Materials) — confirm the listing is live, priced, and the
      product is published (not draft). UTM params are already attached. ✅
- [ ] 🔴 **`pnpm build` passes clean** with no type errors or warnings (production build, not dev).
- [ ] 🔴 **`pnpm lint` and `pnpm test` pass.**

---

## 1. SEO & metadata  ⚠️ (currently only a bare `title`)

→ `src/app/layout.tsx` (extend the exported `metadata`, add `viewport`)

- [ ] **`metadataBase`** set to the production origin (required for OG/Twitter/canonical
      absolute URLs to resolve). e.g. `new URL("https://materials.dannystuart.com")`.
- [ ] **Title** — real, descriptive, < 60 chars. Consider a template:
      `title: { default: "Materials¹ — …", template: "%s · Materials¹" }`.
- [ ] **Meta description** — compelling, < 160 chars, in brand voice (no banned words).
- [ ] **Canonical URL** (`alternates: { canonical: "/" }`).
- [ ] **`robots` metadata** confirms indexable: `index: true, follow: true`. Double-check no
      stray `noindex` survives from staging. (None found in `src` today ✅.)
- [ ] **`app/robots.ts`** — emit `/robots.txt`, allow all, reference the sitemap URL.
- [ ] **`app/sitemap.ts`** — emit `/sitemap.xml` (single home URL is fine; include `lastModified`).
- [ ] **`export const viewport`** (Next 16 split this out of `metadata`) — set
      `themeColor: "#010100"` (matches `--color-hero-bg`) and default `width`/`initialScale`.
- [ ] **Structured data (JSON-LD)** — optional but high-value for a product page. Add a
      `<script type="application/ld+json">` with `Organization` + `WebSite`, and a `Product`
      with `offers` (price, currency, availability) per pack. Validate in Google Rich Results Test.
- [ ] **Language** — `<html lang="en">` ✅ already set.

---

## 2. Open Graph & social sharing  ❌

- [ ] **OG tags** via `openGraph` in metadata: `title`, `description`, `url`, `siteName`,
      `type: "website"`, `locale: "en_US"`, and `images`.
- [ ] **OG image, 1200×630.** Either a static `app/opengraph-image.png` (Next auto-wires it)
      or a generated `app/opengraph-image.tsx` (ImageResponse). Use a real Material render, not
      a screenshot of text. Keep < 8 MB; ideally < 1 MB.
- [ ] **Twitter card** via `twitter` in metadata: `card: "summary_large_image"`, `title`,
      `description`, `images`, and `creator`/`site` (`@dannystuart` per the footer Threads handle —
      confirm the X/Twitter handle).
- [ ] **Test the unfurl** on X, LinkedIn, Slack, iMessage, Discord, Facebook debugger, and
      `opengraph.dev`. Each caches aggressively — test the final production URL.

---

## 3. Favicon, icons & PWA  ⚠️ (only `favicon.ico`)

- [ ] `favicon.ico` ✅ present (`src/app/favicon.ico`, auto-served).
- [ ] **`app/icon.svg`** (or `icon.png`) — crisp modern tab icon, dark-mode aware.
- [ ] **`app/apple-icon.png`** — 180×180 for iOS home-screen.
- [ ] **`app/manifest.webmanifest`** (or `manifest.ts`) — `name`, `short_name`, `theme_color`
      `#010100`, `background_color`, `display: "standalone"`, and 192 + 512 + maskable icons.
- [ ] **Confirm the favicon actually renders** in a real browser tab (Chrome, Safari, Firefox)
      and isn't a stale default. Check light and dark OS themes.

---

## 4. Performance & page-load speed  ⚠️ (141 MB `public/`, heavy JS)

**Asset weight — biggest quick win:**
- [ ] **Prune unreferenced source files (~102 MB of dead weight).** Confirmed zero references in `src`:
      - `public/videos/macbook-video-5.mov` (36 MB) ❌ unused
      - `public/videos/macbook-video-2.mov` (25 MB) ❌ unused
      - `public/videos/macbook-demo.mp4` (41 MB) — the **720** variant is what's referenced;
        confirm the full-res original is unused, then remove.
      - `public/materials-grid.jpg` — 0 references ❌ unused.
      Delete these (they're not git-tracked yet, but they bloat the working tree and risk being added).
- [ ] **Remove `public/.DS_Store`** and add `.DS_Store` to `.gitignore`.
- [ ] **Optimize the large PNGs** — `example-1.png` (3 MB), `example-2.png` (3 MB),
      `digital-cube.png` (1.2 MB), the three card PNGs (1.1–1.9 MB each). Serve through
      `next/image` (AVIF/WebP, responsive `sizes`) or pre-compress to WebP/AVIF. Currently these
      are large raw PNGs.
- [ ] **`next.config.ts` image config** — set `images.formats: ['image/avif', 'image/webp']`
      and sensible `deviceSizes` if using `next/image`. (Config is empty today.)

**Video (responsive variants + posters already exist ✅):**
- [ ] Every decorative video is `muted playsInline loop` (iOS won't autoplay otherwise) and has
      a `poster` ✅ (posters present). Re-verify on real iOS Safari.
- [ ] Below-the-fold videos use `preload="none"` (or `metadata`); only the hero preloads.
- [ ] Correct source per viewport — confirm the 720/960/1024 variants are actually selected on
      mobile and the 1920 isn't shipped to phones.
- [ ] WebGL/R3F contexts: the recent commit suspends WebGL in `display:none` variants
      (~10→5 live contexts). Re-verify the live context count in production build and that
      contexts release on unmount.

**JS / Core Web Vitals:**
- [ ] **LCP** — hero poster/video is the LCP element; make sure it's prioritized and the poster
      is small. Target LCP < 2.5 s.
- [ ] **CLS** — reserve space (aspect-ratio / fixed dimensions) for every video and image so
      nothing reflows on load. Target CLS < 0.1.
- [ ] **INP/TBT** — `three`, `@react-three/fiber`, `gsap` are heavy. Code-split / `dynamic()`
      the R3F and below-fold sections so they don't block first paint. Target INP < 200 ms.
- [ ] **Bundle analysis** — add `@next/bundle-analyzer`, check the first-load JS, confirm three.js
      is lazy and not in the hero's critical path.
- [ ] **Fonts** — `next/font` self-hosts Plus Jakarta Sans (no external Google request) ✅,
      `display: swap` ✅. Confirm no FOIT and that only the 4 needed weights ship.
- [ ] **Run Lighthouse** (mobile + desktop) on the production build, and one **WebPageTest**
      pass on throttled 4G. Target ≥ 90 across Performance/SEO/Best-Practices/Accessibility.
- [ ] Strip stray `console.log`s from production.

---

## 5. Accessibility  ⚠️

- [ ] **Heading order** — exactly one `<h1>`, no skipped levels down the page.
- [ ] **Alt text** on every meaningful image; decorative element boxes stay `aria-hidden` ✅
      (per design-system rule).
- [ ] **Colour contrast** — audit the ink ladder rungs against WCAG AA (4.5:1 body / 3:1 large).
      The `muted 45%` and `faint 35%` rungs on near-black will likely fail for body text — keep
      them for large/decorative text only, or verify each usage.
- [ ] **Keyboard nav** — tab through the whole page: CTA, all links, FAQ accordions (§06),
      pack cards. Visible focus rings everywhere; logical order; no keyboard traps.
- [ ] **Skip-to-content link** as the first focusable element.
- [ ] **`prefers-reduced-motion`** — design rule says every motion element has a fallback;
      verify the hero, §02 carousel, §04 recipe, §05 macbook, and footer all honour it.
- [ ] **Tap targets ≥ 44px** ✅ (standing mobile check) — re-verify the floating CTA and footer links.
- [ ] **Screen-reader pass** (VoiceOver) on the full page — landmarks (`main` ✅, add `header`/
      `nav`/`footer` roles where appropriate), link text is meaningful, videos aren't announced as
      broken.
- [ ] **`aria-label`** on icon-only / ambiguous controls (footer social links, etc.).

---

## 6. Functional & cross-browser QA  ❌ (no 404/error pages)

- [ ] **`app/not-found.tsx`** — branded 404 (default Next page is unstyled).
- [ ] **`app/error.tsx`** — error boundary so a runtime error doesn't white-screen.
- [ ] **No console errors or warnings** on load or scroll (standing check) — verify in production build.
- [ ] **External links** — `mailto:`, `dannystuart.com`, Threads, Gumroad all open correctly;
      add `rel="noopener noreferrer"` to any `target="_blank"`.
- [ ] **Cross-browser** — Chrome, Safari, Firefox, Edge; iOS Safari + Android Chrome. Video
      autoplay and GSAP scroll behave on each.
- [ ] **Responsive sweep** — 375, 390, 768, 1024, 1440, 1600, 2200 (the breakpoints in the
      design system). No horizontal scroll; 24px gutters preserved on mobile.
- [ ] **Scroll-restore** behaviour (the inline script + `ScrollRestore`) works on real reload/back-nav.

---

## 7. Analytics, monitoring & privacy  ❌

- [ ] **`@vercel/analytics`** + **`@vercel/speed-insights`** (cookieless, GDPR-friendly, gives
      real-user Core Web Vitals). Add to the layout.
- [ ] **Conversion tracking** — at minimum a UTM-tagged Gumroad link ✅; optionally an event on
      Buy-click.
- [ ] **Error monitoring** (Sentry or similar) — optional for a landing page, nice for launch week.
- [ ] **Cookie consent** — only needed if you add cookie-based tracking. Vercel Analytics is
      cookieless, so likely **not required** — confirm before adding any banner.

---

## 8. Legal / trust  ⚠️

- [ ] **Privacy note** — even minimal, since you collect email (`mailto:`) and link to a store.
- [ ] **Contact path** is present ✅ (`hi@dannystuart.com` in footer) — verify it's live.
- [ ] **Refund/terms** — handled by Gumroad on their side; make sure nothing on-page promises
      otherwise.
- [ ] **Copyright / year** in footer is current.

---

## 9. Deployment & infrastructure (Vercel)  ❌

- [ ] **Custom domain** attached, DNS propagated, **HTTPS/SSL** active.
- [ ] **Canonical host redirect** — pick `www` vs apex and 301 the other (avoids duplicate-content
      + matches `metadataBase`).
- [ ] **Environment variables** set in the Vercel project (Production scope) if any are needed.
- [ ] **Production deploy smoke-test** on a preview URL before promoting.
- [ ] **Remove any Vercel password/deployment protection** before launch (or it'll block crawlers).
- [ ] **Build & function settings** — confirm Node version, build command (`next build`), no
      leftover preview-only flags.
- [ ] **Caching** — `/_next/static` is immutable by default ✅; confirm `public/` assets get
      long cache headers (Vercel default is fine).

---

## 10. Security headers  ❌ (`next.config.ts` is empty)

Add a `headers()` block in `next.config.ts` (or `vercel.json`):
- [ ] `Strict-Transport-Security` (HSTS).
- [ ] `X-Content-Type-Options: nosniff`.
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`.
- [ ] `X-Frame-Options: DENY` (or `frame-ancestors` via CSP).
- [ ] `Permissions-Policy` — lock down camera/mic/geolocation you don't use.
- [ ] **Content-Security-Policy** — optional/advanced; with R3F + GSAP + Vercel Analytics it
      needs care. At minimum confirm no inline-script CSP would break the scroll-restoration
      inline `<script>` in `layout.tsx`.
- [ ] **No secrets in the client bundle** — grep the build output for keys.

---

## 11. Final pre-flight (the morning of launch)

- [ ] Lighthouse ≥ 90 on all four categories (mobile profile).
- [ ] Social unfurl verified on X / LinkedIn / Slack / iMessage (production URL).
- [ ] Google Rich Results Test passes for the JSON-LD.
- [ ] **Google Search Console** — verify ownership, submit `sitemap.xml`. (Bing Webmaster optional.)
- [ ] Real-device check: one iPhone (Safari), one Android (Chrome).
- [ ] Throttled 3G/4G load feels acceptable; LCP poster shows fast.
- [ ] All CTAs land on a live, purchasable Gumroad listing.
- [ ] Tab-through + VoiceOver pass with no blockers.
- [ ] `prefers-reduced-motion` on: page is calm and usable.
- [ ] Final `pnpm build` clean; deploy promoted to production; smoke-test the live domain.

---

### Suggested order of attack
1. **Blockers** (§0) — dead CTA, build/lint/test green.
2. **Metadata + icons + OG** (§1–3) — one focused pass in `layout.tsx` + a few `app/` files.
3. **Asset prune + image/video perf** (§4) — biggest measurable win, mostly deletion + config.
4. **A11y + QA sweep** (§5–6) — add `not-found`/`error`, run the reviewers.
5. **Infra + headers + analytics** (§7, §9, §10) — Vercel-side.
6. **Pre-flight** (§11) — the launch-morning ritual.
