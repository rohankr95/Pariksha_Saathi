import { RoadmapForm } from "@/components/admin/roadmap-form";
import { getT } from "@/lib/i18n/server";
import { createRoadmap } from "../actions";

export default async function NewRoadmapPage() {
  const t = await getT();
  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("career.admin.newTitle")}</h1>
      <RoadmapForm action={createRoadmap} />
    </div>
  );
}
