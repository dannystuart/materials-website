/**
 * The glowing connector line that links the hub to each output in §02.
 *
 * Shared between the desktop diagram (`PitchDiagram.tsx`, two static lines) and
 * the mobile swipe carousel (`PitchMobileCarousel.tsx`, two swipe-tracked
 * lines). Pure presentational SVG — given two endpoints and a colour pair it
 * draws a halo / bloom / crisp-core stack plus glowing end nodes.
 */

/** Warm endpoint colour (design-tool output). */
export const WARM = "rgb(255,160,80)";
/** Cool endpoint colour (AI / style-reference output). */
export const COOL = "rgb(107,173,255)";
/** Hot near-white colour (the hub end / gradient mid-stop). */
export const HOT = "rgb(240,246,255)";

export function GlowConnector({
  id,
  x1,
  y1,
  x2,
  y2,
  startColor,
  endColor,
}: {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  startColor: string;
  endColor: string;
}) {
  return (
    <g aria-hidden="true" data-reveal="connector">
      <defs>
        <linearGradient
          id={`${id}-grad`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={startColor} stopOpacity="0.9" />
          <stop offset="55%" stopColor={HOT} stopOpacity="0.95" />
          <stop offset="100%" stopColor={endColor} stopOpacity="0.9" />
        </linearGradient>
        <filter
          id={`${id}-glow`}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>

      {/* Outer halo — wide soft blur */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={`url(#${id}-grad)`}
        strokeWidth="10"
        strokeOpacity="0.32"
        filter={`url(#${id}-glow)`}
      />
      {/* Mid bloom */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={`url(#${id}-grad)`}
        strokeWidth="3"
        strokeOpacity="0.55"
        filter={`url(#${id}-glow)`}
      />
      {/* Crisp core */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={`url(#${id}-grad)`}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />

      {/* Endpoints — small glowing nodes */}
      <circle
        cx={x1}
        cy={y1}
        r="5"
        fill={startColor}
        opacity="0.35"
        filter={`url(#${id}-glow)`}
      />
      <circle cx={x1} cy={y1} r="1.8" fill={startColor} />
      <circle
        cx={x2}
        cy={y2}
        r="5"
        fill={endColor}
        opacity="0.35"
        filter={`url(#${id}-glow)`}
      />
      <circle cx={x2} cy={y2} r="1.8" fill={endColor} />
    </g>
  );
}
