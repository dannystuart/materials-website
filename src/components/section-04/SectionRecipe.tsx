import { SectionRecipeDesktop } from "./SectionRecipeDesktop";
import { SectionRecipeMobile } from "./SectionRecipeMobile";

export function SectionRecipe() {
  return (
    <>
      <div className="hidden lg:block">
        <SectionRecipeDesktop />
      </div>
      <div className="block lg:hidden">
        <SectionRecipeMobile />
      </div>
    </>
  );
}
