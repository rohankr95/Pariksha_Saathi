"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";
import { shuffle, scoreAttempt, type StudentAnswer } from "@/lib/quiz-scoring";
import type { AttemptState } from "@/lib/quiz-types";
import { recordQuizActivity } from "@/lib/gamification";

export async function startAttempt(quizId: string) {
  const session = await requireUser();
  const userId = session.user.id;

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { questions: true } });
  if (!quiz || !quiz.isPublished) redirect("/quiz");

  const now = new Date();
  if (quiz.startAt && now < quiz.startAt) redirect("/quiz");
  if (quiz.endAt && now > quiz.endAt) redirect("/quiz");

  const existing = await prisma.quizAttempt.findFirst({
    where: { quizId, studentId: userId, submittedAt: null },
  });
  if (existing) redirect(`/quiz/${quizId}/take?attempt=${existing.id}`);

  const completedCount = await prisma.quizAttempt.count({
    where: { quizId, studentId: userId, submittedAt: { not: null } },
  });
  if (completedCount >= quiz.maxAttempts) redirect(`/quiz/${quizId}`);

  const questionOrder = shuffle(quiz.questions.map((q) => q.id)).map(String);
  const optionOrder: Record<string, number[]> = {};
  for (const q of quiz.questions) {
    const options = Array.isArray(q.optionsJson) ? q.optionsJson : [];
    optionOrder[q.id] = shuffle(options.map((_, i) => i));
  }

  const initialState: AttemptState = { questionOrder, optionOrder, answers: {}, markedForReview: [] };

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId,
      studentId: userId,
      startedAt: now,
      answersJson: initialState as unknown as Prisma.InputJsonValue,
    },
  });

  redirect(`/quiz/${quizId}/take?attempt=${attempt.id}`);
}

async function loadState(attemptId: string, userId: string) {
  const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.studentId !== userId || attempt.submittedAt) return null;
  return { attempt, state: attempt.answersJson as unknown as AttemptState };
}

export async function saveAnswer(attemptId: string, questionId: string, answer: StudentAnswer) {
  const session = await requireUser();
  const loaded = await loadState(attemptId, session.user.id);
  if (!loaded) return;

  const nextState: AttemptState = {
    ...loaded.state,
    answers: { ...loaded.state.answers, [questionId]: answer },
  };
  await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: { answersJson: nextState as unknown as Prisma.InputJsonValue },
  });
}

export async function toggleMarkForReview(attemptId: string, questionId: string) {
  const session = await requireUser();
  const loaded = await loadState(attemptId, session.user.id);
  if (!loaded) return;

  const marked = new Set(loaded.state.markedForReview);
  if (marked.has(questionId)) marked.delete(questionId);
  else marked.add(questionId);

  const nextState: AttemptState = { ...loaded.state, markedForReview: [...marked] };
  await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: { answersJson: nextState as unknown as Prisma.InputJsonValue },
  });
}

export async function recordTabSwitch(attemptId: string) {
  const session = await requireUser();
  const loaded = await loadState(attemptId, session.user.id);
  if (!loaded) return;
  await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: { tabSwitches: { increment: 1 } },
  });
}

export async function submitAttempt(attemptId: string) {
  const session = await requireUser();
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: { quiz: { include: { questions: true } } },
  });
  if (!attempt || attempt.studentId !== session.user.id) redirect("/quiz");
  if (attempt.submittedAt) redirect(`/quiz/${attempt.quizId}/result/${attempt.id}`);

  const state = attempt.answersJson as unknown as AttemptState;
  const { score, accuracy, details } = scoreAttempt(
    attempt.quiz.questions,
    state.answers,
    attempt.quiz.negativeMarks
  );

  const now = new Date();
  const rawSeconds = Math.round((now.getTime() - attempt.startedAt.getTime()) / 1000);
  const cappedSeconds = Math.min(rawSeconds, attempt.quiz.timeLimitMin * 60 + 30);

  const finalState = { ...state, details };

  await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      submittedAt: now,
      score,
      accuracy,
      timeTakenSec: cappedSeconds,
      answersJson: finalState as unknown as Prisma.InputJsonValue,
    },
  });

  await recordQuizActivity(session.user.id, { accuracy });

  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  redirect(`/quiz/${attempt.quizId}/result/${attemptId}`);
}
