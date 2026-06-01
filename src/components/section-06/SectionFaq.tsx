import { SectionFaqDesktop } from "./SectionFaqDesktop";
import { SectionFaqMobile } from "./SectionFaqMobile";

export function SectionFaq() {
  return (
    <>
      <div className="hidden lg:block">
        <SectionFaqDesktop />
      </div>
      <div className="block lg:hidden">
        <SectionFaqMobile />
      </div>
    </>
  );
}
