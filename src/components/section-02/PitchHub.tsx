import Image from "next/image";
import { ElementBox3D } from "@/components/primitives/ElementBox3D";
import { clsx } from "@/lib/clsx";

type Props = {
  size?: number;
  className?: string;
};

export function PitchHub({ size = 320, className }: Props) {
  return (
    <div
      className={clsx("relative", className)}
      style={{ width: size, height: size }}
      data-pitch-hub
    >
      <div className="specimen-mask absolute inset-0">
        <Image
          src="/digital-cube.png"
          alt="The hub Material — an iridescent specimen used for both design and AI work"
          fill
          sizes={`${size}px`}
          priority={false}
          className="object-cover"
        />
      </div>
      <div className="pointer-events-none absolute right-0 top-0 translate-x-[25%] -translate-y-[25%]">
        <ElementBox3D
          id="014"
          symbol="Ic"
          category="iridescent"
          size={140}
          decorative
        />
      </div>
    </div>
  );
}
