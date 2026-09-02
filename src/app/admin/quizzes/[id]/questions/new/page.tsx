import { QuestionForm } from "@/components/admin/question-form";
import { createQuestion } from "../actions";

export default async function NewQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">नया प्रश्न जोड़ें</h1>
      <QuestionForm action={createQuestion.bind(null, id)} />
    </div>
  );
}
