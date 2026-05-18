import { SectionPitchDesktop } from "./SectionPitchDesktop";
import { SectionPitchMobile } from "./SectionPitchMobile";

export function SectionPitch() {
  return (
    <>
      <div className="hidden lg:block">
        <SectionPitchDesktop />
      </div>
      <div className="block lg:hidden">
        <SectionPitchMobile />
      </div>
    </>
  );
}
