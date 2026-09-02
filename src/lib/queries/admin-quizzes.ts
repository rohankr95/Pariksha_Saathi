import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function getAdminQuizzes(params: { q?: string; page?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const where = {
    ...(params.q ? { title: { contains: params.q, mode: "insensitive" as const } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.quiz.findMany({
      where,
      include: { subject: true, chapter: true, _count: { select: { questions: true, attempts: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.quiz.count({ where }),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getQuizWithQuestions(quizId: string) {
  return prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      subject: true,
      chapter: true,
      questions: { orderBy: { displayOrder: "asc" } },
    },
  });
}
