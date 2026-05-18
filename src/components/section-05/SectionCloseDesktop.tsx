import { PackCard } from "./PackCard";
import { PAID_PACK, FREE_PACK } from "./packData";

export function SectionCloseDesktop() {
  return (
    <section
      className="relative bg-hero-bg py-32 text-white"
      aria-labelledby="close-heading"
    >
      <div className="px-12 min-[1600px]:px-[12vw] min-[2200px]:px-[20vw]">
        <h2
          id="close-heading"
          className="font-display text-[56px] font-semibold leading-[1.15] tracking-[-0.0334em]"
        >
          Two ways{" "}
          <span className="bg-[linear-gradient(90deg,#A855F7_0%,#F97316_100%)] bg-clip-text text-transparent">
            in
          </span>
          .
        </h2>
      </div>

      <div className="mt-24 flex justify-center gap-20">
        <div className="w-[440px] self-start">
          <PackCard pack={PAID_PACK} />
        </div>
        <div className="w-[440px] self-start">
          <PackCard pack={FREE_PACK} />
        </div>
      </div>

      <div className="mt-16 px-12 text-right min-[1600px]:px-[12vw] min-[2200px]:px-[20vw]">
        <p className="font-display text-[14px] text-white/65">
          Have fun ✌️ — Danny
        </p>
      </div>
    </section>
  );
}
