import { prisma } from "@/lib/prisma";
import type { ClassLevel, Language } from "@prisma/client";

const PAGE_SIZE = 12;

export type LectureFilters = {
  classLevel?: ClassLevel;
  subjectId?: string;
  chapterId?: string;
  language?: Language;
  tag?: string;
  q?: string;
  page?: number;
};

export async function getLectures(filters: LectureFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const where = {
    isPublished: true,
    deletedAt: null,
    ...(filters.classLevel ? { classLevel: filters.classLevel } : {}),
    ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
    ...(filters.chapterId ? { chapterId: filters.chapterId } : {}),
    ...(filters.language ? { language: filters.language } : {}),
    ...(filters.tag ? { tags: { has: filters.tag } } : {}),
    ...(filters.q
      ? { title: { contains: filters.q, mode: "insensitive" as const } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.lecture.findMany({
      where,
      include: { subject: true, chapter: true, createdBy: { select: { name: true } } },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.lecture.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getLectureById(id: string) {
  return prisma.lecture.findFirst({
    where: { id, isPublished: true, deletedAt: null },
    include: {
      subject: true,
      chapter: true,
      createdBy: { select: { name: true } },
      playlist: { include: { lectures: { where: { isPublished: true }, orderBy: { displayOrder: "asc" } } } },
    },
  });
}

export async function getRelatedLectures(subjectId: string, excludeId: string) {
  return prisma.lecture.findMany({
    where: { subjectId, isPublished: true, deletedAt: null, id: { not: excludeId } },
    orderBy: { views: "desc" },
    take: 4,
  });
}

export async function getWatchedLectureIds(userId: string) {
  const rows = await prisma.lectureWatchProgress.findMany({
    where: { userId, watched: true },
    select: { lectureId: true },
  });
  return new Set(rows.map((r) => r.lectureId));
}
