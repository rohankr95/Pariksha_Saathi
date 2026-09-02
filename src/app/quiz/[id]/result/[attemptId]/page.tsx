import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, Target, TrendingUp, BookOpen, PlayCircle } from "lucide-react";
import { requireUser } from "@/lib/require-role";
import { getAttemptForResult, getPercentile } from "@/lib/queries/quizzes";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResultCelebration } from "@/components/quiz/result-celebration";
import type { AttemptState } from "@/lib/quiz-types";
import { isCorrect } from "@/lib/quiz-scoring";

function answerText(options: string[] | null, type: string, value: unknown): string {
  if (value === null || value === undefined) return "उत्तर नहीं दिया गया";
  if (type === "TRUE_FALSE") return value ? "सही" : "गलत";
  if (type === "NUMERIC") return String(value);
  if (Array.isArray(value)) {
    return value.map((i) => options?.[Number(i)] ?? "?").join(", ") || "उत्तर नहीं दिया गया";
  }
  return options?.[Number(value)] ?? "?";
}

export default async function QuizResultPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const { id, attemptId } = await params;
  const session = await requireUser();
  const attempt = await getAttemptForResult(attemptId, session.user.id);
  if (!attempt || attempt.quizId !== id) notFound();

  const percentile = await getPercentile(attempt.quizId, attempt.score ?? 0);
  const state = attempt.answersJson as unknown as AttemptState;
  const totalMarks = attempt.quiz.questions.reduce((sum, q) => sum + q.marks, 0);
  const timeTakenMin = Math.round((attempt.timeTakenSec ?? 0) / 60);
  const passed = (attempt.accuracy ?? 0) >= 60;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <ResultCelebration accuracy={attempt.accuracy ?? 0} />

      <div className="text-center">
        <p className="text-sm text-muted-foreground">{attempt.quiz.title}</p>
        <p className="mt-2 font-sans text-4xl font-bold text-foreground">
          {attempt.score} <span className="text-lg font-normal text-muted-foreground">/ {totalMarks}</span>
        </p>
        <p className="mt-1 text-base font-medium text-foreground">
          {passed ? "शानदार! आपने अच्छा प्रदर्शन किया 🎉" : "कोई बात नहीं, फिर से कोशिश करें"}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 text-center">
          <Target className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-1.5 text-lg font-bold text-foreground">{attempt.accuracy}%</p>
          <p className="text-xs text-muted-foreground">सटीकता</p>
        </Card>
        <Card className="p-4 text-center">
          <Clock className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-1.5 text-lg font-bold text-foreground">{timeTakenMin} मिनट</p>
          <p className="text-xs text-muted-foreground">समय लगा</p>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-1.5 text-lg font-bold text-foreground">{percentile}वाँ</p>
          <p className="text-xs text-muted-foreground">पर्सेंटाइल</p>
        </Card>
        <Card className="p-4 text-center">
          <CheckCircle2 className="mx-auto h-5 w-5 text-success" />
          <p className="mt-1.5 text-lg font-bold text-foreground">
            {attempt.quiz.questions.filter((q) => isCorrect(q.type, q.correctAnswer, state.answers[q.id] ?? null)).length}
            /{attempt.quiz.questions.length}
          </p>
          <p className="text-xs text-muted-foreground">सही उत्तर</p>
        </Card>
      </div>

      {(attempt.accuracy ?? 0) < 60 && (
        <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 border-[var(--color-section-lectures)]/30 bg-[var(--color-section-lectures)]/5 p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {attempt.quiz.subject.nameHi}
              {attempt.quiz.chapter ? ` · ${attempt.quiz.chapter.nameHi}` : ""} में सुधार की गुंजाइश है
            </p>
            <p className="text-xs text-muted-foreground">संबंधित व्याख्यान और नोट्स देखें</p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/lectures?subjectId=${attempt.quiz.subjectId}${attempt.quiz.chapterId ? `&chapterId=${attempt.quiz.chapterId}` : ""}`}>
                <PlayCircle className="h-4 w-4" /> व्याख्यान
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/notes?subjectId=${attempt.quiz.subjectId}${attempt.quiz.chapterId ? `&chapterId=${attempt.quiz.chapterId}` : ""}`}>
                <BookOpen className="h-4 w-4" /> नोट्स
              </Link>
            </Button>
          </div>
        </Card>
      )}

      <div className="mt-8 space-y-4">
        <h2 className="font-sans text-lg font-bold text-foreground">विस्तृत समीक्षा</h2>
        {attempt.quiz.questions.map((q, i) => {
          const options = Array.isArray(q.optionsJson) ? q.optionsJson.map(String) : null;
          const given = state.answers[q.id] ?? null;
          const correct = isCorrect(q.type, q.correctAnswer, given);
          return (
            <Card key={q.id} className="p-4">
              <div className="flex items-start gap-2.5">
                {correct ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-section-examdates)]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {i + 1}. {q.textHi}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    आपका उत्तर: <span className="text-foreground">{answerText(options, q.type, given)}</span>
                  </p>
                  {!correct && (
                    <p className="text-xs text-success">
                      सही उत्तर: {answerText(options, q.type, q.correctAnswer)}
                    </p>
                  )}
                  {q.explanation && (
                    <p className="mt-1.5 rounded-[var(--radius-sm)] bg-surface-muted p-2 text-xs text-muted-foreground">
                      {q.explanation}
                    </p>
                  )}
                  <Badge variant="outline" className="mt-2 text-[10px]">{q.marks} अंक</Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/quiz">और प्रश्नोत्तरी देखें</Link>
        </Button>
        <Button asChild>
          <Link href="/leaderboard">शीर्ष प्रदर्शन देखें</Link>
        </Button>
      </div>
    </div>
  );
}
