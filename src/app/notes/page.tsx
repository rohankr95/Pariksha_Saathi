import { BookOpen } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function NotesPage() {
  return (
    <ComingSoon
      icon={BookOpen}
      titleHi="नोट्स"
      titleEn="Notes"
      descHi="यह मॉड्यूल आगामी चरण में पूर्ण सामग्री के साथ जोड़ा जाएगा।"
    />
  );
}
