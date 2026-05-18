import { PackCard } from "./PackCard";
import { PAID_PACK, FREE_PACK } from "./packData";

export function SectionCloseMobile() {
  return (
    <section
      className="relative bg-hero-bg px-6 py-20 text-white"
      aria-labelledby="close-heading-m"
    >
      <h2
        id="close-heading-m"
        className="font-display text-[40px] font-semibold leading-[1.15] tracking-[-0.025em]"
      >
        Two ways in.
      </h2>

      <div className="mt-12 flex flex-col gap-12">
        <PackCard pack={PAID_PACK} />
        <PackCard pack={FREE_PACK} />
      </div>

      <p className="mt-12 font-display text-[14px] text-white/65">
        Have fun ✌️ — Danny
      </p>
    </section>
  );
}
