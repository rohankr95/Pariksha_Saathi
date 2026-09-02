import { BookOpen } from "lucide-react";
import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminNotesPage() {
  return (
    <AdminComingSoon
      icon={BookOpen}
      titleHi="नोट्स"
      titleEn="Notes"
      phase="Phase 2"
    />
  );
}
