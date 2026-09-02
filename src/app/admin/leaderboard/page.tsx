import { Crown } from "lucide-react";
import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminLeaderboardPage() {
  return (
    <AdminComingSoon
      icon={Crown}
      titleHi="शीर्ष प्रदर्शन"
      titleEn="Leaderboard"
      phase="Phase 4"
    />
  );
}
