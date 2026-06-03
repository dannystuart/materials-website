import { clsx } from "@/lib/clsx";

type Props = {
  label: string;
  variant?: "desktop" | "mobile";
  children: React.ReactNode;
  align?: "start" | "center";
  fill?: boolean;
  className?: string;
};

export function RecipeTile({
  label,
  variant = "desktop",
  children,
  align = "start",
  fill = false,
  className,
}: Props) {
  const padding = variant === "desktop" ? "p-7" : "p-5";
  const height = variant === "desktop" ? "h-[340px]" : "h-[240px]";
  const contentTop = variant === "desktop" ? "top-[68px]" : "top-[58px]";
  return (
    <div
      className={clsx(
        "relative w-full overflow-hidden rounded-[20px] border border-white/[0.18] bg-white/[0.02]",
        height,
        padding,
        className,
      )}
    >
      <div
        className={clsx(
          "t-caps absolute top-6 text-white/75",
          variant === "desktop" ? "left-7" : "left-5",
        )}
      >
        {label}
      </div>
      <div
        className={clsx(
          "absolute flex",
          variant === "desktop" ? "inset-x-7" : "inset-x-5",
          fill ? contentTop : "",
          fill ? (variant === "desktop" ? "bottom-7" : "bottom-5") : "bottom-6",
          align === "center" ? "justify-center items-center" : "items-end",
        )}
      >
        {children}
      </div>
    </div>
  );
}
