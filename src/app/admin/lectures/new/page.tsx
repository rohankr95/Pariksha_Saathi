import { prisma } from "@/lib/prisma";
import { LectureForm } from "@/components/admin/lecture-form";
import { createLecture } from "../actions";

export default async function NewLecturePage() {
  const [subjects, chapters] = await Promise.all([
    prisma.subject.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.chapter.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">नया व्याख्यान जोड़ें</h1>
      <LectureForm subjects={subjects} chapters={chapters} action={createLecture} />
    </div>
  );
}
