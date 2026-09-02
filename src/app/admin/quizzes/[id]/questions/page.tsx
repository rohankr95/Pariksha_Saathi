import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus, ArrowLeft, Lightbulb } from "lucide-react";
import { getQuizWithQuestions } from "@/lib/queries/admin-quizzes";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteQuestion, moveQuestionOrder } from "./actions";

const TYPE_LABEL: Record<string, string> = {
  MCQ_SINGLE: "एकल MCQ",
  MCQ_MULTIPLE: "बहु MCQ",
  TRUE_FALSE: "सही/गलत",
  ASSERTION_REASON: "अभिकथन-कारण",
  NUMERIC: "संख्यात्मक",
};

export default async function QuizQuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = await getQuizWithQuestions(id);
  if (!quiz) notFound();

  const totalMarks = quiz.questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div>
      <Link href="/admin/quizzes" className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> सभी प्रश्नोत्तरी
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground">{quiz.title}</h1>
          <p className="text-sm text-muted-foreground">
            {quiz.questions.length} प्रश्न · कुल {totalMarks} अंक
            {quiz.questions.length === 0 && " — प्रकाशित करने से पहले कम से कम एक प्रश्न जोड़ें"}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={`/admin/quizzes/${id}/questions/new`}>
            <Plus className="h-4 w-4" /> प्रश्न जोड़ें
          </Link>
        </Button>
      </div>

      {quiz.questions.length === 0 ? (
        <EmptyState icon={Lightbulb} title="अभी कोई प्रश्न नहीं है" description="ऊपर 'प्रश्न जोड़ें' बटन से शुरू करें।" />
      ) : (
        <div className="space-y-3">
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-border p-4">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{q.textHi}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{TYPE_LABEL[q.type]}</Badge>
                  <Badge variant="outline" className="text-[10px]">{q.marks} अंक</Badge>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <form action={moveQuestionOrder.bind(null, q.id, id, "up")}>
                  <button type="submit" className="rounded p-1 hover:bg-surface-muted" aria-label="ऊपर ले जाएँ">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                </form>
                <form action={moveQuestionOrder.bind(null, q.id, id, "down")}>
                  <button type="submit" className="rounded p-1 hover:bg-surface-muted" aria-label="नीचे ले जाएँ">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </form>
                <Link
                  href={`/admin/quizzes/${id}/questions/${q.id}/edit`}
                  className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                  aria-label="संपादित करें"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <form action={deleteQuestion.bind(null, q.id, id)}>
                  <ConfirmSubmitButton confirmMessage="क्या आप वाकई इस प्रश्न को हटाना चाहते हैं?" aria-label="हटाएँ">
                    <Trash2 className="h-4 w-4" />
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
