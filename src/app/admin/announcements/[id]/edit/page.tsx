import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { getT } from "@/lib/i18n/server";
import { updateAnnouncement } from "../../actions";

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) notFound();

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("admin.announcements.editTitle")}</h1>
      <AnnouncementForm initial={announcement} action={updateAnnouncement.bind(null, id)} />
    </div>
  );
}
