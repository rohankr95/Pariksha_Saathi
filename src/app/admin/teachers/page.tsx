import { Users } from "lucide-react";
import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminTeachersPage() {
  return (
    <AdminComingSoon
      icon={Users}
      titleHi="शिक्षक प्रबंधन"
      titleEn="Teacher Management"
      phase="Phase 6"
    />
  );
}
