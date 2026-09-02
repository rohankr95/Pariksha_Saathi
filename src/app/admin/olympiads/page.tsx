import { Medal } from "lucide-react";
import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminOlympiadsPage() {
  return (
    <AdminComingSoon
      icon={Medal}
      titleHi="ओलंपियाड"
      titleEn="Olympiads"
      phase="Phase 3"
    />
  );
}
