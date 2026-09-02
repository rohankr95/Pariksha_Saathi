import { Lightbulb } from "lucide-react";
import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminQuizzesPage() {
  return (
    <AdminComingSoon
      icon={Lightbulb}
      titleHi="प्रश्नोत्तरी"
      titleEn="Quizzes"
      phase="Phase 4"
    />
  );
}
