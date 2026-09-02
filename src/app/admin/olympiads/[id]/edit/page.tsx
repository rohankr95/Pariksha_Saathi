import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OlympiadForm } from "@/components/admin/olympiad-form";
import { getT } from "@/lib/i18n/server";
import { updateOlympiad } from "../../actions";

export default async function EditOlympiadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const olympiad = await prisma.olympiad.findUnique({ where: { id } });
  if (!olympiad) notFound();

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("olympiad.admin.editTitle")}</h1>
      <OlympiadForm initial={olympiad} action={updateOlympiad.bind(null, id)} />
    </div>
  );
}
