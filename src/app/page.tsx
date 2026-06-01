import { Hero } from "@/components/hero/Hero";
import { SectionPitch } from "@/components/section-02/SectionPitch";
import { SectionLibrary } from "@/components/section-03/SectionLibrary";
import { SectionRecipe } from "@/components/section-04/SectionRecipe";
import { SectionClose } from "@/components/section-05/SectionClose";
import { SectionFaq } from "@/components/section-06/SectionFaq";
import { Footer } from "@/components/footer/Footer";
import { FloatingCta } from "@/components/floating-cta/FloatingCta";
import { ScrollRestore } from "@/components/scroll-restore/ScrollRestore";

export default function HomePage() {
  return (
    <>
      <ScrollRestore />
      <main>
        <Hero />
        <SectionPitch />
        <SectionLibrary />
        <SectionRecipe />
        <SectionClose />
        <SectionFaq />
        <Footer />
      </main>
      <FloatingCta />
    </>
  );
}
