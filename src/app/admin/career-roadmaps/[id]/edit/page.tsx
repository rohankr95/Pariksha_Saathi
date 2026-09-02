import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RoadmapForm } from "@/components/admin/roadmap-form";
import { getT } from "@/lib/i18n/server";
import { updateRoadmap } from "../../actions";

export default async function EditRoadmapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const roadmap = await prisma.careerRoadmap.findUnique({ where: { id } });
  if (!roadmap) notFound();

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("career.admin.editTitle")}</h1>
      <RoadmapForm initial={roadmap} action={updateRoadmap.bind(null, id)} />
    </div>
  );
}
