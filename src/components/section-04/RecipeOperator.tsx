import { clsx } from "@/lib/clsx";

type Props = {
  symbol: "+" | "=";
  size?: "lg" | "md";
  className?: string;
};

export function RecipeOperator({ symbol, size = "lg", className }: Props) {
  const fontSize = size === "lg" ? 72 : 44;
  return (
    <div
      className={clsx(
        "font-display select-none text-white/85",
        className,
      )}
      style={{
        fontSize,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: "-0.04em",
      }}
      aria-hidden="true"
    >
      {symbol}
    </div>
  );
}
