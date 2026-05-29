import {
  GridDots,
  TechnicalGridLines,
} from "@/components/primitives/TechnicalGridLines";
import { PitchOrbits } from "./PitchOrbits";
import type { PointerTargetRef } from "./useSectionPointer";

const WARM = "rgb(255,160,80)";
const COOL = "rgb(107,173,255)";
const HOT = "rgb(240,246,255)";

function GlowConnector({
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

const DESKTOP_VIEW: [number, number] = [1344, 680];
const DESKTOP_CENTER: [number, number] = [672, 280];
const DESKTOP_RADII = [200, 256, 324, 408, 504];

const MOBILE_VIEW: [number, number] = [400, 400];
const MOBILE_CENTER: [number, number] = [200, 200];
const MOBILE_RADII = [120, 152, 188];

type Props = {
  pointer?: PointerTargetRef;
};

export function PitchDiagramBackground({ pointer }: Props) {
  return (
    <>
      <div
        data-reveal="orbits"
        className="pointer-events-none absolute inset-0"
      >
        <PitchOrbits
          className="absolute inset-0 h-full w-full"
          viewBox={DESKTOP_VIEW}
          center={DESKTOP_CENTER}
          radii={DESKTOP_RADII}
          pointer={pointer}
        />
      </div>

      <TechnicalGridLines
        viewBox={`0 0 ${DESKTOP_VIEW[0]} ${DESKTOP_VIEW[1]}`}
        className="absolute inset-0 h-full w-full"
      >
        <GlowConnector
          id="conn-design"
          x1={360}
          y1={152}
          x2={512}
          y2={280}
          startColor={WARM}
          endColor={HOT}
        />
        <GlowConnector
          id="conn-ai"
          x1={832}
          y1={280}
          x2={984}
          y2={424}
          startColor={HOT}
          endColor={COOL}
        />

        <g data-reveal="diagram-meta">
          <GridDots x={40} y={40} rows={3} cols={3} gap={10} size={1} />
          <GridDots x={1264} y={608} rows={3} cols={3} gap={10} size={1} />
        </g>
      </TechnicalGridLines>
    </>
  );
}

export function PitchMobileOrbits({ pointer }: Props) {
  return (
    <div
      data-reveal="orbits"
      className="pointer-events-none absolute inset-0"
    >
      <PitchOrbits
        className="absolute inset-0 h-full w-full"
        viewBox={MOBILE_VIEW}
        center={MOBILE_CENTER}
        radii={MOBILE_RADII}
        pointer={pointer}
        parallax={[6, 6]}
      />
    </div>
  );
}
