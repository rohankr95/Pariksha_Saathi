import { prisma } from "@/lib/prisma";
import { QuizForm } from "@/components/admin/quiz-form";
import { getT } from "@/lib/i18n/server";
import { createQuiz } from "../actions";

export default async function NewQuizPage() {
  const t = await getT();
  const [subjects, chapters] = await Promise.all([
    prisma.subject.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.chapter.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("quiz.admin.createTitle")}</h1>
      <QuizForm subjects={subjects} chapters={chapters} action={createQuiz} />
    </div>
  );
}
