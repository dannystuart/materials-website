import Image from "next/image";
import { forwardRef } from "react";
import { clsx } from "@/lib/clsx";

export type LibraryPlateVariant = "stills" | "loops" | "transparent";

type VariantMeta = {
  title: string;
  format: string;
  resolution: string;
  colorFormat: string;
};

const VARIANTS: Record<LibraryPlateVariant, VariantMeta> = {
  stills: {
    title: "Stills",
    format: "PNG",
    resolution: "2048 × 2048",
    colorFormat: "sRGB",
  },
  loops: {
    title: "Loops",
    format: "MP4 · WebM",
    resolution: "1920 × 1920",
    colorFormat: "sRGB",
  },
  transparent: {
    title: "Transparent",
    format: "PNG · alpha",
    resolution: "2048 × 2048",
    colorFormat: "sRGB + alpha",
  },
};

type Props = {
  className?: string;
  variant?: LibraryPlateVariant;
};

export const LibraryPlate = forwardRef<HTMLDivElement, Props>(function LibraryPlate(
  { className, variant = "stills" },
  ref,
) {
  const meta = VARIANTS[variant];
  return (
    <div
      ref={ref}
      className={clsx(
        "relative w-full overflow-hidden rounded-[20px]",
        "bg-[#F4F4F6] text-[#0B0B0E]",
        "ring-1 ring-black/[0.06]",
        className,
      )}
      style={{
        boxShadow:
          "0 60px 120px -30px rgba(0,0,0,0.85), 0 30px 60px -20px rgba(0,0,0,0.65), 0 8px 24px -8px rgba(0,0,0,0.55)",
      }}
      aria-label={`Materials Figma file — ${meta.title} page`}
    >
      <div className="px-7 pt-6 pb-4">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-baseline gap-1">
            <span
              className="font-display font-bold tracking-tight text-[#0B0B0E]"
              style={{ fontSize: "26px", lineHeight: 1 }}
            >
              Materials
            </span>
            <span
              className="font-display font-bold text-[#0B0B0E]"
              style={{ fontSize: "12px", lineHeight: 1 }}
            >
              1
            </span>
          </div>

          <span
            className="font-display font-semibold text-[#0B0B0E]"
            style={{
              fontSize: "20px",
              lineHeight: 1,
              letterSpacing: "-0.3px",
            }}
          >
            {meta.title}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-6">
          <dl
            className="font-display grid grid-cols-[auto_1fr] gap-x-2 gap-y-[3px]"
            style={{ fontSize: "10.5px", lineHeight: 1.45 }}
          >
            <dt className="text-[#5B5BD6] font-medium">Format:</dt>
            <dd className="text-[#0B0B0E]">{meta.format}</dd>
            <dt className="text-[#5B5BD6] font-medium">Original resolution:</dt>
            <dd className="text-[#0B0B0E]">{meta.resolution}</dd>
            <dt className="text-[#5B5BD6] font-medium">Colour format:</dt>
            <dd className="text-[#0B0B0E]">{meta.colorFormat}</dd>
            <dt className="text-[#5B5BD6] font-medium">Licensing:</dt>
            <dd className="text-[#0B0B0E]">Personal + Commercial Use</dd>
          </dl>

          <div
            className="font-display font-medium text-[#0B0B0E]/70 text-right whitespace-nowrap"
            style={{ fontSize: "10.5px", lineHeight: 1.45 }}
          >
            Last Updated: 24 – 01 – 2026
          </div>
        </div>
      </div>

      <div className="relative library-plate-fade px-5 pb-2">
        <div className="relative w-full overflow-hidden rounded-[12px] bg-[#EDEDEF]">
          <Image
            src="/materials-grid.jpg"
            alt=""
            width={1200}
            height={792}
            className="block w-full h-auto"
            priority={false}
          />
        </div>
      </div>
    </div>
  );
});

export const LIBRARY_PLATE_VARIANTS: LibraryPlateVariant[] = [
  "stills",
  "loops",
  "transparent",
];

export function libraryPlateTitle(variant: LibraryPlateVariant): string {
  return VARIANTS[variant].title;
}
