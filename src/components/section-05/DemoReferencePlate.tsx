import { clsx } from "@/lib/clsx";
import { ElementBox } from "../primitives/ElementBox";
import {
  TechnicalGridLines,
  GridArcs,
  GridTicks,
} from "../primitives/TechnicalGridLines";
import { SCRUB_PX } from "./scrubConfig";

type Props = { variant: "desktop" | "mobile" };

// The §05 demo's "reference plate" — the periodic-table instrumentation field
// that the laptop demo reads as the specimen of. It lives in the retained
// pin-travel band directly ABOVE the demo (see useMacbookScrub onLeave / Bug 4),
// so it must be exactly SCRUB_PX tall and is mounted as an `absolute bottom-full`
// child of the demo block — that anchors it to the frame, hidden behind the
// fixed video during the scrub, revealed on the way in and on up-scroll.
//
// The grid field is anchored to the BOTTOM edge: concentric arcs fan UP from the
// point where the laptop emerges, so the instrumentation visibly converges on the
// specimen below. An element-box designation sits on the baseline hairline (boxes
// must land on a grid line, never float), with a figure label as the catalog
// caption. Whole plate is decorative → aria-hidden.
export function DemoReferencePlate({ variant }: Props) {
  const isDesktop = variant === "desktop";
  const height = isDesktop ? SCRUB_PX.desktop : SCRUB_PX.mobile;
  const width = isDesktop ? 1440 : 390;

  // Baseline sits a little above the laptop so the box + ticks have a hairline to
  // rest on while the arcs converge toward the frame below.
  const baselineFromBottom = isDesktop ? 132 : 92;
  const baselineY = height - baselineFromBottom;

  // Arc field centred just below the plate's bottom edge (≈ the laptop's lid
  // hinge) so the rings read as reference contours around the specimen.
  const arcCx = width / 2;
  const arcCy = height + (isDesktop ? 40 : 24);
  const arcRadii = isDesktop
    ? [220, 360, 500, 640, 780]
    : [150, 250, 350, 450];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-full left-0 w-full overflow-hidden"
      style={{ height }}
    >
      {/* Reference field — low-contrast atmosphere-blue instrumentation. */}
      <TechnicalGridLines
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 h-full w-full"
      >
        <GridArcs cx={arcCx} cy={arcCy} radii={arcRadii} />
        {/* Baseline hairline the element box + ticks rest on. */}
        <line
          x1={0}
          y1={baselineY}
          x2={width}
          y2={baselineY}
          stroke="rgba(167,196,232,0.18)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <GridTicks
          x={isDesktop ? 48 : 24}
          y={baselineY}
          count={isDesktop ? 18 : 9}
          spacing={isDesktop ? 56 : 36}
          length={6}
          orientation="horizontal"
        />
      </TechnicalGridLines>

      {/* Element-box designation, sitting ON the baseline, left-offset (editorial,
          mirrors the hero's left-12 logo offset). */}
      <div
        className={clsx(
          "absolute",
          isDesktop ? "left-12 wide:left-[12vw]" : "left-6",
        )}
        style={{ bottom: baselineFromBottom }}
      >
        <ElementBox
          id="100"
          symbol="Fl"
          category="fluid"
          size={isDesktop ? "lg" : "md"}
          decorative
          // Lift the box so it straddles the baseline rather than sitting fully
          // above it — a designation pinned to its reference line.
          className="translate-y-px"
        />
      </div>

      {/* Catalog caption, right-offset — the figure's label. Deliberately terse
          catalog metadata (figure no. · designation · edition), NOT a repeat of
          the demo's headline that sits right below it. "Ed. 1" echoes the nav
          wordmark ("Materials¹ — Edition 1"). */}
      <div
        className={clsx(
          "absolute text-right",
          isDesktop ? "right-24 wide:right-[12vw]" : "right-6",
        )}
        style={{ bottom: baselineFromBottom + (isDesktop ? 6 : 2) }}
      >
        <div className="t-caps text-white/45">FIG. 05</div>
        <div className="t-micro mt-2 text-white/35">Fl · 100 · Ed. 1</div>
      </div>
    </div>
  );
}
