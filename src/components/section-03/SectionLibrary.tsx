import { SectionLibraryDesktop } from "./SectionLibraryDesktop";
import { SectionLibraryMobile } from "./SectionLibraryMobile";

export function SectionLibrary() {
  return (
    <>
      <div className="hidden lg:block">
        <SectionLibraryDesktop />
      </div>
      <div className="block lg:hidden">
        <SectionLibraryMobile />
      </div>
    </>
  );
}
