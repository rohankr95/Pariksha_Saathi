import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LectureForm } from "@/components/admin/lecture-form";
import { getT } from "@/lib/i18n/server";
import { updateLecture } from "../../actions";

export default async function EditLecturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lecture, subjects, chapters] = await Promise.all([
    prisma.lecture.findUnique({ where: { id } }),
    prisma.subject.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.chapter.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);
  if (!lecture) notFound();
  const t = await getT();

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("lectures.admin.editTitle")}</h1>
      <LectureForm
        subjects={subjects}
        chapters={chapters}
        initial={lecture}
        action={updateLecture.bind(null, id)}
      />
    </div>
  );
}
