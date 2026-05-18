import { clsx } from "@/lib/clsx";

export type ElementCategoryCode =
  | "Mt"
  | "Gl"
  | "Cr"
  | "Fl"
  | "Or"
  | "Vb"
  | "Ds"
  | "Ic";

export type ElementCategoryName =
  | "matte"
  | "gloss"
  | "chrome"
  | "fluid"
  | "organic"
  | "vibrant"
  | "dust"
  | "iridescent";

export type ElementBoxSize = "sm" | "md" | "lg";

type Props = {
  id: string;
  symbol: ElementCategoryCode;
  category: ElementCategoryName;
  size?: ElementBoxSize;
  decorative?: boolean;
  className?: string;
};

const SIZE = {
  sm: {
    box: "w-[68px] p-2",
    id: "text-[9px] tracking-[0.12em]",
    symbol: "text-[22px] leading-none",
    category: "text-[8px] tracking-[0.18em]",
  },
  md: {
    box: "w-[112px] p-3",
    id: "text-[10px] tracking-[0.14em]",
    symbol: "text-[40px] leading-none",
    category: "text-[9px] tracking-[0.22em]",
  },
  lg: {
    box: "w-[168px] p-4",
    id: "text-[11px] tracking-[0.16em]",
    symbol: "text-[64px] leading-none",
    category: "text-[10px] tracking-[0.24em]",
  },
} as const;

export function ElementBox({
  id,
  symbol,
  category,
  size = "md",
  decorative = false,
  className,
}: Props) {
  const s = SIZE[size];
  return (
    <div
      className={clsx(
        "font-display select-none border border-white/15 bg-white/[0.015] text-white/85",
        s.box,
        className,
      )}
      aria-hidden={decorative || undefined}
      role={decorative ? "presentation" : undefined}
      data-element-box
    >
      <div
        className={clsx(
          "flex items-start justify-between font-medium uppercase text-white/55",
          s.id,
        )}
      >
        <span>{id}</span>
      </div>
      <div
        className={clsx(
          "mt-1 font-semibold tracking-tight text-white",
          s.symbol,
        )}
      >
        {symbol}
      </div>
      <div
        className={clsx(
          "mt-1 font-medium uppercase text-white/55",
          s.category,
        )}
      >
        {category}
      </div>
    </div>
  );
}
