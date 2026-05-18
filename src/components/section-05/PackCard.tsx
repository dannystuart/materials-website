import type { Pack } from "./packData";

type Props = { pack: Pack };

export function PackCard({ pack }: Props) {
  return (
    <article
      className="relative isolate rounded-[20px] border border-white/[0.07] bg-[rgba(14,14,16,0.92)] p-8 font-display text-white"
      data-pack-variant={pack.variant}
    >
      <div className="text-[12px] font-medium uppercase tracking-[0.14em] text-white/60">
        {pack.catalogHeader}
      </div>

      <div className="mt-6">
        <h3 className="text-[32px] font-semibold leading-tight tracking-[-0.01em]">
          {pack.name}
        </h3>
        <p className="mt-2 text-[14px] leading-snug text-white/65">
          {pack.tagline}
        </p>
      </div>

      <div className="mt-8">
        <div className="text-[44px] font-semibold leading-none">{pack.price}</div>
        {pack.priceStrap ? (
          <div className="mt-1 text-[12px] text-white/55">{pack.priceStrap}</div>
        ) : null}
      </div>

      <ul className="mt-8 flex flex-col gap-2">
        {pack.inventory.map((item) => (
          <li
            key={item.text}
            className="flex items-start gap-3 text-[14px] leading-snug text-white/85"
          >
            <span aria-hidden="true" className="shrink-0">
              {item.emoji}
            </span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>

      <a
        href={pack.ctaHref}
        className={
          pack.variant === "paid"
            ? "mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-[14px] font-semibold text-[#0A0A0F]"
            : "mt-8 inline-flex h-12 w-full items-center justify-center rounded-full border border-white/20 bg-transparent px-5 text-[14px] font-semibold text-white"
        }
      >
        {pack.ctaLabel}
      </a>
    </article>
  );
}
