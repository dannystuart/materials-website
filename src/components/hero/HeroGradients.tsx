export function HeroGradients() {
  return (
    <div
      className="hero-gradients pointer-events-none absolute inset-x-0 bottom-0 h-[689px]"
      data-hero-gradients
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 100% at 50% 100%, #2C5EA0 0%, rgba(44,94,160,0) 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 75% at 50% 100%, #5395ED 0%, rgba(83,149,237,0) 70%)",
          mixBlendMode: "plus-lighter",
        }}
      />
    </div>
  );
}
