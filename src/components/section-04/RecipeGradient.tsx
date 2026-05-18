export function RecipeGradient() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-[689px]"
      aria-hidden="true"
      data-recipe-gradient
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 150% 100% at 50% 0%, rgba(194,76,30,0.32) 0%, rgba(194,76,30,0) 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 80% at 50% 0%, rgba(249,115,22,0.30) 0%, rgba(249,115,22,0) 70%)",
          mixBlendMode: "plus-lighter",
        }}
      />
    </div>
  );
}
