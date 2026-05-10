# Hero Section — Design Document

**Date:** 2026-05-10
**Project:** Materials marketing website
**Figma:** node `317:314` in Materials-Marketing file
**Source video:** `Materials-Hero.mp4` (230 MB master)

---

## Goal

A cinematic hero section where a video of a translucent, glass-like popsicle scrubs through as the user scrolls, while the brand logo, headline, and ambient gradients reveal in layered stages on top of it.

## Project setup

Fresh Next.js 15 (App Router) + TypeScript strict + Tailwind CSS + GSAP project, scaffolded with pnpm. Single-page marketing site; this Hero is the first section, with room to grow.

```
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    hero/
      Hero.tsx              # composition + responsive switch
      HeroDesktop.tsx       # pinned scroll scrub timeline
      HeroMobile.tsx        # static layout + on-mount reveal
      HeroVideo.tsx
      HeroLogo.tsx
      HeroHeadline.tsx
      HeroGradients.tsx
      useHeroTimeline.ts    # GSAP timeline hook (desktop)
      useReducedMotion.ts
  lib/
    gsap.ts                 # registerPlugin(ScrollTrigger)
public/
  videos/
    materials-hero.mp4      # re-encoded for scrub
    materials-hero.webm     # VP9 fallback
  fonts/                    # if self-hosting
```

## Layout (desktop, end state)

Mirrors Figma frame `317:314` at 1752 × 1291 design canvas:

- **Background:** `#010100` full bleed
- **Video:** centered initially, ends shifted left and shrunk (~78% scale)
- **Logo "Materials":** left, white SVG wordmark, ~292 px wide initially, shrinks to ~70%
- **Headline:** right column, `Plus Jakarta Sans 600`, 64 px, line-height 1.3, tracking `-2.13px`, max-width ~595 px
- **"creative":** styled italic gradient script (purple→orange) — delivered as SVG asset from Figma
- **Bottom gradients:** two stacked radial gradients (blues), 689 px tall, anchored to the bottom

## Animation timeline (desktop)

Pinned `ScrollTrigger` over **3000 px** of scroll, mapped to a single GSAP timeline (`scrub: 1` for smoothing). All percentages refer to timeline progress.

| Range    | Element        | Properties |
|----------|----------------|------------|
| 0–100%   | Video          | `currentTime: 0 → video.duration`, `ease: none` |
| 5–20%    | Logo           | `opacity: 0→1`, `scale: 0.96→1`, `y: 12→0`, `filter: blur(6px)→blur(0)` |
| 40–55%   | Video          | `x: 0→-12%`, `scale: 1→0.78` |
| 40–55%   | Logo           | `scale: 1→0.7` (resizes to make room for shifted video) |
| 50–75%   | Headline words | per-word stagger: `opacity: 0→1`, `y: 14→0`, `filter: blur(10px)→blur(0)`, ~50 ms apart, with extra inter-line delay (~120 ms) |
| 80–100%  | Gradients      | `opacity: 0→1` |

The video sits at z-index 1, gradients at 2 (bottom-anchored, `mix-blend-plus-lighter` on the second layer per Figma), logo at 3, headline at 3. All scaling/translation uses `transform` only (no layout thrash).

## Video scrubbing implementation

GSAP animates the `<video>` element's `currentTime`:

```ts
gsap.to(videoEl, {
  currentTime: videoEl.duration,
  ease: "none",
  scrollTrigger: {
    trigger: heroSection,
    start: "top top",
    end: "+=3000",
    scrub: 1,
    pin: true,
    anticipatePin: 1,
  },
});
```

Requirements on the `<video>` tag: `muted`, `playsInline`, `preload="auto"`, no `controls`, no `autoPlay`. The browser only renders frames when `currentTime` is set.

### Encoding

The 230 MB master needs re-encoding for smooth scrub. Default keyframe interval (~2 s) makes backward scrubbing stutter because the decoder has to walk back to the previous keyframe. We re-encode with a keyframe every ~6 frames:

```bash
ffmpeg -i Materials-Hero.mp4 \
  -vcodec libx264 -crf 22 -preset slow \
  -g 6 -keyint_min 6 -sc_threshold 0 \
  -movflags +faststart \
  -an \
  public/videos/materials-hero.mp4
```

Plus a VP9 WebM with the same keyframe density as a `<source>` fallback. Target sizes: ~8–15 MB each at 1080p; we'll downscale if larger.

## Headline reveal mechanic

The headline reads:

> Visual ingredients for designers, motion artists, and **creative** explorers.

Wrapped as semantic `<h1>` for SEO/a11y. We split it into per-word `<span>` elements at build time (avoids hydration mismatches) and animate each span. "creative" is rendered with the SVG from Figma (`imgCreative`) inside its own span — animated as a single unit with the same blur+fade+y treatment.

```tsx
<h1>
  {LINES.map((line, lineIdx) => (
    <span className="block" key={lineIdx}>
      {line.map((word, wordIdx) =>
        word.type === "svg" ? (
          <span className="word inline-block" key={wordIdx}>
            <CreativeSvg />
          </span>
        ) : (
          <span className="word inline-block" key={wordIdx}>{word.text} </span>
        )
      )}
    </span>
  ))}
</h1>
```

Pre-split lines (matched to Figma):
1. "Visual ingredients"
2. "for designers,"
3. "motion artists, and"
4. "**creative** explorers."

GSAP stagger: `{ each: 0.05, from: "start" }` per line, with each line offset by ~0.12 s.

## Mobile (`< 1024px`)

No pin, no scrub. Layout reflows to a single-column 100vh hero:

- Logo top
- Video centered (auto-plays once, muted, playsInline, **no loop**, with `poster` first frame)
- Headline below video
- Gradients pinned to bottom of the section

On mount, a triggered timeline plays once:

| Order | Element | Effect |
|-------|---------|--------|
| 1     | Logo    | fade + blur + y over 0.5 s |
| 2     | Video   | starts playback (after small delay), fades from 0 → 1 |
| 3     | Headline | per-word stagger like desktop, but compressed to ~0.8 s total |
| 4     | Gradients | fade in over 0.6 s |

Video is downscaled to 720p for mobile (separate `<source media>` query) to keep cellular load reasonable. Same keyframe-dense encoding.

## Accessibility

- `prefers-reduced-motion: reduce` — skip all entrance animations, show the final composed state immediately. Video shows poster frame, no scrub. Headline visible at full opacity.
- Headline is a real `<h1>`; per-word spans are `aria-hidden="false"` and read naturally.
- Video has empty `aria-label` and `role="presentation"` (decorative).
- Logo SVG has `<title>Materials</title>` and `aria-label`.
- All interactive content (none in this hero) remains keyboard reachable.

## Performance

- Use `next/font` for Plus Jakarta Sans (subset latin, display swap).
- SVG logo and "creative" inlined as React components.
- Video lazy-loaded with `preload="auto"` only on viewports above 1024 px; mobile uses `preload="metadata"` + poster.
- Single `useGSAP` hook with cleanup on unmount.
- Pin spacer uses `pinType: "fixed"` for non-touch, default for touch.

## Open items deferred to implementation

- Exact pixel values for video shift on different desktop widths (will use vw-based math).
- "creative" SVG color values — may be replaced with CSS gradient + italic font once we identify the typeface.
- Video poster generation (one frame from the master at t=0).

## Out of scope

- Other site sections (header nav, footer, body content).
- CMS integration.
- Analytics.
- Internationalisation.

---

## Sign-off

This design captures: Next.js scaffold (option A), pinned scroll scrub (option A), staggered C-style overlapping reveals, video + logo both shrink as text appears, word-by-word blur/fade/y headline reveal with line stagger, mobile shows reflowed video that plays once with simpler entrance animations.
