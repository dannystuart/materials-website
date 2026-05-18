import { PackCard } from "./PackCard";
import { PAID_PACK, FREE_PACK } from "./packData";

export function SectionCloseDesktop() {
  return (
    <section className="py-32" aria-labelledby="close-heading">
      <h2
        id="close-heading"
        className="font-display text-[56px] font-semibold text-white"
      >
        Two ways in.
      </h2>
      <div className="mt-24 flex gap-20">
        <div className="w-[440px]">
          <PackCard pack={PAID_PACK} />
        </div>
        <div className="w-[440px]">
          <PackCard pack={FREE_PACK} />
        </div>
      </div>
    </section>
  );
}
