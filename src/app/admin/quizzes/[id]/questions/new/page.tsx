import { QuestionForm } from "@/components/admin/question-form";
import { getT } from "@/lib/i18n/server";
import { createQuestion } from "../actions";

export default async function NewQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("quiz.admin.addQuestionTitle")}</h1>
      <QuestionForm action={createQuestion.bind(null, id)} />
    </div>
  );
}
