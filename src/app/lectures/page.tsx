import { PlayCircle } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function LecturesPage() {
  return (
    <ComingSoon
      icon={PlayCircle}
      titleHi="व्याख्यान"
      titleEn="Lectures"
      descHi="यह मॉड्यूल आगामी चरण में पूर्ण सामग्री के साथ जोड़ा जाएगा।"
    />
  );
}
