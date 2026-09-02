import { prisma } from "@/lib/prisma";
import type { ClassLevel } from "@prisma/client";

export async function getAvailableQuizzes(filters: { classLevel?: ClassLevel; subjectId?: string }) {
  return prisma.quiz.findMany({
    where: {
      isPublished: true,
      ...(filters.classLevel ? { classLevel: filters.classLevel } : {}),
      ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
    },
    include: { subject: true, chapter: true, _count: { select: { questions: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMyAttemptsSummary(quizId: string, userId: string) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { quizId, studentId: userId },
    orderBy: { startedAt: "desc" },
  });
  const completed = attempts.filter((a) => a.submittedAt !== null);
  const inProgress = attempts.find((a) => a.submittedAt === null) ?? null;
  return { completedCount: completed.length, inProgress, lastCompleted: completed[0] ?? null };
}

export async function getAttemptForTaking(attemptId: string, userId: string) {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          questions: { orderBy: { displayOrder: "asc" } },
        },
      },
    },
  });
  if (!attempt || attempt.studentId !== userId) return null;
  return attempt;
}

export async function getAttemptForResult(attemptId: string, userId: string) {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: { subject: true, chapter: true, questions: { orderBy: { displayOrder: "asc" } } },
      },
    },
  });
  if (!attempt || attempt.studentId !== userId || !attempt.submittedAt) return null;
  return attempt;
}

export async function getPercentile(quizId: string, score: number) {
  const [total, below] = await Promise.all([
    prisma.quizAttempt.count({ where: { quizId, submittedAt: { not: null } } }),
    prisma.quizAttempt.count({ where: { quizId, submittedAt: { not: null }, score: { lt: score } } }),
  ]);
  if (total <= 1) return 100;
  return Math.round((below / (total - 1)) * 100);
}
