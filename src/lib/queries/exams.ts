import { prisma } from "@/lib/prisma";
import type { ClassLevel } from "@prisma/client";

const PAGE_SIZE = 12;

export type ExamFilters = {
  classLevel?: ClassLevel;
  category?: string;
  page?: number;
};

export async function getExams(filters: ExamFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const where = {
    isPublished: true,
    ...(filters.classLevel ? { classes: { has: filters.classLevel } } : {}),
    ...(filters.category ? { category: filters.category } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      orderBy: [{ applyEnd: "asc" }, { examDate: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.exam.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getExamCategories() {
  const rows = await prisma.exam.findMany({
    where: { isPublished: true },
    select: { category: true },
    distinct: ["category"],
  });
  return rows.map((r) => r.category);
}

export async function getUrgentDeadlines(days = 30) {
  const now = new Date();
  const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return prisma.exam.findMany({
    where: { isPublished: true, applyEnd: { gte: now, lte: until } },
    orderBy: { applyEnd: "asc" },
    take: 5,
  });
}

export async function getExamById(id: string) {
  return prisma.exam.findFirst({ where: { id, isPublished: true } });
}

export async function getSubscribedExamIds(userId: string) {
  const rows = await prisma.examSubscription.findMany({
    where: { userId },
    select: { examId: true },
  });
  return new Set(rows.map((r) => r.examId));
}
