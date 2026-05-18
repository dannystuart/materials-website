import { SectionCloseDesktop } from "./SectionCloseDesktop";
import { SectionCloseMobile } from "./SectionCloseMobile";

export function SectionClose() {
  return (
    <>
      <div className="hidden lg:block">
        <SectionCloseDesktop />
      </div>
      <div className="block lg:hidden">
        <SectionCloseMobile />
      </div>
    </>
  );
}
