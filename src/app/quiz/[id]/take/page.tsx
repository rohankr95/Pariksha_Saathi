import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/require-role";
import { getAttemptForTaking } from "@/lib/queries/quizzes";
import { buildClientQuestions } from "@/lib/build-client-questions";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import type { AttemptState } from "@/lib/quiz-types";

export default async function TakeQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const { id } = await params;
  const { attempt: attemptId } = await searchParams;
  const session = await requireUser();

  if (!attemptId) redirect(`/quiz/${id}`);

  const attempt = await getAttemptForTaking(attemptId, session.user.id);
  if (!attempt || attempt.quizId !== id) notFound();

  if (attempt.submittedAt) redirect(`/quiz/${id}/result/${attempt.id}`);

  const state = attempt.answersJson as unknown as AttemptState;
  const clientQuestions = buildClientQuestions(attempt.quiz.questions, state);

  return (
    <QuizRunner
      attemptId={attempt.id}
      title={attempt.quiz.title}
      timeLimitMin={attempt.quiz.timeLimitMin}
      startedAtISO={attempt.startedAt.toISOString()}
      questions={clientQuestions}
      optionOrder={state.optionOrder}
      initialAnswers={state.answers}
      initialMarked={state.markedForReview}
    />
  );
}
