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
import { getT } from "@/lib/i18n/server";

function answerText(
  t: (key: string, vars?: Record<string, string | number>) => string,
  options: string[] | null,
  type: string,
  value: unknown
): string {
  if (value === null || value === undefined) return t("quiz.result.notAnswered");
  if (type === "TRUE_FALSE") return value ? t("quiz.result.true") : t("quiz.result.false");
  if (type === "NUMERIC") return String(value);
  if (Array.isArray(value)) {
    return value.map((i) => options?.[Number(i)] ?? "?").join(", ") || t("quiz.result.notAnswered");
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
  const t = await getT();
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
          {passed ? t("quiz.result.passed") : t("quiz.result.failed")}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 text-center">
          <Target className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-1.5 text-lg font-bold text-foreground">{attempt.accuracy}%</p>
          <p className="text-xs text-muted-foreground">{t("quiz.result.accuracy")}</p>
        </Card>
        <Card className="p-4 text-center">
          <Clock className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-1.5 text-lg font-bold text-foreground">{t("quiz.result.timeTaken", { minutes: timeTakenMin })}</p>
          <p className="text-xs text-muted-foreground">{t("quiz.result.timeTakenLabel")}</p>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-1.5 text-lg font-bold text-foreground">{t("quiz.result.percentile", { value: percentile })}</p>
          <p className="text-xs text-muted-foreground">{t("quiz.result.percentileLabel")}</p>
        </Card>
        <Card className="p-4 text-center">
          <CheckCircle2 className="mx-auto h-5 w-5 text-success" />
          <p className="mt-1.5 text-lg font-bold text-foreground">
            {attempt.quiz.questions.filter((q) => isCorrect(q.type, q.correctAnswer, state.answers[q.id] ?? null)).length}
            /{attempt.quiz.questions.length}
          </p>
          <p className="text-xs text-muted-foreground">{t("quiz.result.correctAnswers")}</p>
        </Card>
      </div>

      {(attempt.accuracy ?? 0) < 60 && (
        <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 border-[var(--color-section-lectures)]/30 bg-[var(--color-section-lectures)]/5 p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t("quiz.result.improveArea", {
                subject: attempt.quiz.subject.nameHi + (attempt.quiz.chapter ? ` · ${attempt.quiz.chapter.nameHi}` : ""),
              })}
            </p>
            <p className="text-xs text-muted-foreground">{t("quiz.result.improveHint")}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/lectures?subjectId=${attempt.quiz.subjectId}${attempt.quiz.chapterId ? `&chapterId=${attempt.quiz.chapterId}` : ""}`}>
                <PlayCircle className="h-4 w-4" /> {t("quiz.result.lectures")}
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/notes?subjectId=${attempt.quiz.subjectId}${attempt.quiz.chapterId ? `&chapterId=${attempt.quiz.chapterId}` : ""}`}>
                <BookOpen className="h-4 w-4" /> {t("quiz.result.notes")}
              </Link>
            </Button>
          </div>
        </Card>
      )}

      <div className="mt-8 space-y-4">
        <h2 className="font-sans text-lg font-bold text-foreground">{t("quiz.result.detailedReview")}</h2>
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
                    {t("quiz.result.yourAnswer")} <span className="text-foreground">{answerText(t, options, q.type, given)}</span>
                  </p>
                  {!correct && (
                    <p className="text-xs text-success">
                      {t("quiz.result.correctAnswer")} {answerText(t, options, q.type, q.correctAnswer)}
                    </p>
                  )}
                  {q.explanation && (
                    <p className="mt-1.5 rounded-[var(--radius-sm)] bg-surface-muted p-2 text-xs text-muted-foreground">
                      {q.explanation}
                    </p>
                  )}
                  <Badge variant="outline" className="mt-2 text-[10px]">{t("quiz.result.marks", { marks: q.marks })}</Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/quiz">{t("quiz.result.moreQuizzes")}</Link>
        </Button>
        <Button asChild>
          <Link href="/leaderboard">{t("quiz.result.viewLeaderboard")}</Link>
        </Button>
      </div>
    </div>
  );
}
