import { prisma } from "@/lib/prisma";
import type { ClassLevel, Language } from "@prisma/client";

const PAGE_SIZE = 15;

export type NoteFilters = {
  classLevel?: ClassLevel;
  subjectId?: string;
  chapterId?: string;
  language?: Language;
  tag?: string;
  q?: string;
  page?: number;
};

export async function getNotes(filters: NoteFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const where = {
    isPublished: true,
    deletedAt: null,
    ...(filters.classLevel ? { classLevel: filters.classLevel } : {}),
    ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
    ...(filters.chapterId ? { chapterId: filters.chapterId } : {}),
    ...(filters.language ? { language: filters.language } : {}),
    ...(filters.tag ? { tags: { has: filters.tag } } : {}),
    ...(filters.q ? { title: { contains: filters.q, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.note.findMany({
      where,
      include: { subject: true, chapter: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.note.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getMostDownloadedNotes() {
  return prisma.note.findMany({
    where: { isPublished: true, deletedAt: null },
    include: { subject: true },
    orderBy: { downloads: "desc" },
    take: 6,
  });
}

export async function getNoteById(id: string) {
  return prisma.note.findFirst({ where: { id, isPublished: true, deletedAt: null } });
}
