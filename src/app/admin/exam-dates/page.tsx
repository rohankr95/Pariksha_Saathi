import { CalendarClock } from "lucide-react";
import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminExamDatesPage() {
  return (
    <AdminComingSoon
      icon={CalendarClock}
      titleHi="परीक्षा तिथि"
      titleEn="Exam Dates"
      phase="Phase 3"
    />
  );
}
