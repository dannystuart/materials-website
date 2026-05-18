import { clsx } from "@/lib/clsx";

const STROKE = "rgba(167,196,232,0.18)";
const STROKE_DIM = "rgba(167,196,232,0.10)";

export function GridArcs({
  cx,
  cy,
  radii,
  className,
}: {
  cx: number;
  cy: number;
  radii: number[];
  className?: string;
}) {
  return (
    <g className={className} aria-hidden="true">
      {radii.map((r, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={i % 2 === 0 ? STROKE : STROKE_DIM}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  );
}

export function GridDots({
  x,
  y,
  rows,
  cols,
  gap,
  size = 1,
  className,
}: {
  x: number;
  y: number;
  rows: number;
  cols: number;
  gap: number;
  size?: number;
  className?: string;
}) {
  const dots: Array<{ cx: number; cy: number }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({ cx: x + c * gap, cy: y + r * gap });
    }
  }
  return (
    <g className={className} aria-hidden="true">
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={size} fill={STROKE_DIM} />
      ))}
    </g>
  );
}

export function GridRules({
  x,
  y,
  width,
  height,
  step,
  className,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  step: number;
  className?: string;
}) {
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  for (let i = 0; i <= width; i += step) {
    lines.push({ x1: x + i, y1: y, x2: x + i, y2: y + height });
  }
  for (let j = 0; j <= height; j += step) {
    lines.push({ x1: x, y1: y + j, x2: x + width, y2: y + j });
  }
  return (
    <g className={className} aria-hidden="true">
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke={STROKE_DIM}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  );
}

export function GridTicks({
  x,
  y,
  count,
  spacing,
  length = 6,
  orientation = "horizontal",
  className,
}: {
  x: number;
  y: number;
  count: number;
  spacing: number;
  length?: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const ticks = Array.from({ length: count }, (_, i) => i);
  return (
    <g className={className} aria-hidden="true">
      {ticks.map((i) =>
        orientation === "horizontal" ? (
          <line
            key={i}
            x1={x + i * spacing}
            y1={y}
            x2={x + i * spacing}
            y2={y + length}
            stroke={STROKE}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ) : (
          <line
            key={i}
            x1={x}
            y1={y + i * spacing}
            x2={x + length}
            y2={y + i * spacing}
            stroke={STROKE}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ),
      )}
    </g>
  );
}

export function GridConnector({
  x1,
  y1,
  x2,
  y2,
  className,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  className?: string;
}) {
  return (
    <g className={className} aria-hidden="true">
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={STROKE}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={x1} cy={y1} r={2} fill="none" stroke={STROKE} strokeWidth={1} />
      <circle cx={x2} cy={y2} r={2} fill="none" stroke={STROKE} strokeWidth={1} />
    </g>
  );
}

export function TechnicalGridLines({
  children,
  viewBox,
  className,
}: {
  children: React.ReactNode;
  viewBox: string;
  className?: string;
}) {
  return (
    <svg
      className={clsx("pointer-events-none", className)}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
