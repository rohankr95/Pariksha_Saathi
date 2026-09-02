import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuizForm } from "@/components/admin/quiz-form";
import { getT } from "@/lib/i18n/server";
import { updateQuiz } from "../../actions";

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const [quiz, subjects, chapters] = await Promise.all([
    prisma.quiz.findUnique({ where: { id } }),
    prisma.subject.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.chapter.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);
  if (!quiz) notFound();

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("quiz.admin.editTitle")}</h1>
      <QuizForm subjects={subjects} chapters={chapters} initial={quiz} action={updateQuiz.bind(null, id)} />
    </div>
  );
}
