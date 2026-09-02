import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuizForm } from "@/components/admin/quiz-form";
import { updateQuiz } from "../../actions";

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [quiz, subjects, chapters] = await Promise.all([
    prisma.quiz.findUnique({ where: { id } }),
    prisma.subject.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.chapter.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);
  if (!quiz) notFound();

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">प्रश्नोत्तरी संपादित करें</h1>
      <QuizForm subjects={subjects} chapters={chapters} initial={quiz} action={updateQuiz.bind(null, id)} />
    </div>
  );
}
