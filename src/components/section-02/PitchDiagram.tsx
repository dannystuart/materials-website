import {
  GridDots,
  TechnicalGridLines,
} from "@/components/primitives/TechnicalGridLines";
import { PitchOrbits } from "./PitchOrbits";
import { GlowConnector, WARM, COOL, HOT } from "./PitchConnector";
import type { PointerTargetRef } from "./useSectionPointer";

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
