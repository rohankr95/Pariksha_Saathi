import { Megaphone } from "lucide-react";
import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminAnnouncementsPage() {
  return (
    <AdminComingSoon
      icon={Megaphone}
      titleHi="सूचना पट्ट"
      titleEn="Announcements"
      phase="Phase 6"
    />
  );
}
