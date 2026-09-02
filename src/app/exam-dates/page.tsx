import { CalendarClock } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function ExamDatesPage() {
  return (
    <ComingSoon
      icon={CalendarClock}
      titleHi="परीक्षा तिथि"
      titleEn="Exam Dates"
      descHi="यह मॉड्यूल आगामी चरण में पूर्ण सामग्री के साथ जोड़ा जाएगा।"
    />
  );
}
