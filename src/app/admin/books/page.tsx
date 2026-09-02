import { Library } from "lucide-react";
import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminBooksPage() {
  return (
    <AdminComingSoon
      icon={Library}
      titleHi="पुस्तकें"
      titleEn="Books"
      phase="Phase 2"
    />
  );
}
