import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function getAdminSubjects(params: { q?: string; page?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const where = {
    ...(params.q
      ? { OR: [{ nameHi: { contains: params.q, mode: "insensitive" as const } }, { nameEn: { contains: params.q, mode: "insensitive" as const } }] }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      include: {
        _count: { select: { chapters: true, lectures: true, notes: true, quizzes: true, classRequests: true, answerCopies: true } },
      },
      orderBy: [{ classLevel: "asc" }, { displayOrder: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.subject.count({ where }),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getSubjectById(id: string) {
  return prisma.subject.findUnique({ where: { id } });
}

export async function getSubjectWithChapters(id: string) {
  return prisma.subject.findUnique({
    where: { id },
    include: { chapters: { orderBy: { displayOrder: "asc" } } },
  });
}
