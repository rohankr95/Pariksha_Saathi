import { Trophy } from "lucide-react";
import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminStoriesPage() {
  return (
    <AdminComingSoon
      icon={Trophy}
      titleHi="प्रेरक कहानियाँ"
      titleEn="Motivational Stories"
      phase="Phase 2"
    />
  );
}
