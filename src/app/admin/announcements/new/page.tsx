import { AnnouncementForm } from "@/components/admin/announcement-form";
import { getT } from "@/lib/i18n/server";
import { createAnnouncement } from "../actions";

export default async function NewAnnouncementPage() {
  const t = await getT();
  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("admin.announcements.newTitle")}</h1>
      <AnnouncementForm action={createAnnouncement} />
    </div>
  );
}
