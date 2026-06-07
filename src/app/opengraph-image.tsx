/**
 * ⚠️ PLACEHOLDER social-share card (1200×630).
 *
 * This is a code-generated stand-in (Satori default font, on-brand layout) so
 * social unfurls aren't broken pre-launch. Dan is designing the real banner.
 *
 * TO SWAP: delete this file and drop the designed image in at
 *   src/app/opengraph-image.png   (or .jpg)
 * Next auto-detects the static file and wires og:image + twitter:image to it —
 * no metadata changes needed. Keep it 1200×630, < ~1 MB. (A `.png`/`.jpg` and
 * this `.tsx` cannot coexist — the static file replaces the generator.)
 */
import { ImageResponse } from "next/og";

export const alt =
  "Materials¹ — a library of abstract design textures: stills, video loops, transparent PNGs.";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#010100",
          padding: "96px",
        }}
      >
        {/* Atmosphere — the single cool-blue glow, bottom-anchored */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(ellipse 120% 90% at 50% 100%, rgba(83,149,237,0.3) 0%, rgba(83,149,237,0) 68%)",
          }}
        />

        {/* Element-box catalog label, top-left */}
        <div
          style={{
            position: "absolute",
            top: "96px",
            left: "96px",
            display: "flex",
            fontSize: 24,
            letterSpacing: "0.28em",
            color: "rgba(255,255,255,0.55)",
            textTransform: "uppercase",
          }}
        >
          001 / Mt / matte
        </div>

        {/* Wordmark + tagline, anchored bottom-left (editorial, off-center) */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 132,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: "#FFFFFF",
              lineHeight: 1,
            }}
          >
            Materials¹
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 36,
              maxWidth: 880,
              fontSize: 34,
              fontWeight: 400,
              letterSpacing: "-0.01em",
              lineHeight: 1.35,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            A library of abstract design textures — stills, video loops, transparent PNGs.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
