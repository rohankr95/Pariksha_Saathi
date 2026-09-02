import { ScrollText } from "lucide-react";
import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminAuditLogPage() {
  return (
    <AdminComingSoon
      icon={ScrollText}
      titleHi="ऑडिट लॉग"
      titleEn="Audit Log"
      phase="Phase 6"
    />
  );
}
