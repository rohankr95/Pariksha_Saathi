import { MessageCircleQuestion } from "lucide-react";
import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminDoubtClassesPage() {
  return (
    <AdminComingSoon
      icon={MessageCircleQuestion}
      titleHi="शंका समाधान"
      titleEn="Doubt Classes"
      phase="Phase 5"
    />
  );
}
