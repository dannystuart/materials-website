import { Hero } from "@/components/hero/Hero";
import { SectionPitch } from "@/components/section-02/SectionPitch";
import { SectionLibrary } from "@/components/section-03/SectionLibrary";
import { SectionRecipe } from "@/components/section-04/SectionRecipe";
import { FloatingCta } from "@/components/floating-cta/FloatingCta";

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <SectionPitch />
        <SectionLibrary />
        <SectionRecipe />
        <div style={{ height: "60vh" }} aria-hidden="true" />
      </main>
      <FloatingCta />
    </>
  );
}
