import { prisma } from "@/lib/prisma";
import type { BookCategory, ClassLevel, Language } from "@prisma/client";

const PAGE_SIZE = 15;

export type BookFilters = {
  category?: BookCategory;
  classLevel?: ClassLevel;
  subjectId?: string;
  medium?: Language;
  q?: string;
  page?: number;
};

export async function getBooks(filters: BookFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const where = {
    isPublished: true,
    deletedAt: null,
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.classLevel ? { classLevel: filters.classLevel } : {}),
    ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
    ...(filters.medium ? { medium: filters.medium } : {}),
    ...(filters.q ? { title: { contains: filters.q, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: { subject: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.book.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
