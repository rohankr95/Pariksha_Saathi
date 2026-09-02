import { prisma } from "@/lib/prisma";
import { LectureForm } from "@/components/admin/lecture-form";
import { getT } from "@/lib/i18n/server";
import { createLecture } from "../actions";

export default async function NewLecturePage() {
  const [subjects, chapters] = await Promise.all([
    prisma.subject.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.chapter.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);
  const t = await getT();

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("lectures.admin.newTitle")}</h1>
      <LectureForm subjects={subjects} chapters={chapters} action={createLecture} />
    </div>
  );
}
