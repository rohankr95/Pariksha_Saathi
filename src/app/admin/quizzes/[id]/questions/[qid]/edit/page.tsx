import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuestionForm } from "@/components/admin/question-form";
import { updateQuestion } from "../../actions";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string; qid: string }>;
}) {
  const { id, qid } = await params;
  const question = await prisma.question.findUnique({ where: { id: qid } });
  if (!question || question.quizId !== id) notFound();

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">प्रश्न संपादित करें</h1>
      <QuestionForm initial={question} action={updateQuestion.bind(null, qid, id)} />
    </div>
  );
}
