import { PlayCircle } from "lucide-react";
import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminLecturesPage() {
  return (
    <AdminComingSoon
      icon={PlayCircle}
      titleHi="व्याख्यान"
      titleEn="Lectures"
      phase="Phase 2"
    />
  );
}
