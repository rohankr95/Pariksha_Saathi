import { prisma } from "@/lib/prisma";
import type { ClassLevel } from "@prisma/client";

export const CLASS_LEVEL_LABEL: Record<ClassLevel, string> = {
  CLASS_9: "कक्षा 9",
  CLASS_10: "कक्षा 10",
  CLASS_11: "कक्षा 11",
  CLASS_12: "कक्षा 12",
};

export async function getSubjects(classLevel?: ClassLevel) {
  return prisma.subject.findMany({
    where: { isActive: true, ...(classLevel ? { classLevel } : {}) },
    orderBy: [{ classLevel: "asc" }, { displayOrder: "asc" }],
  });
}

export async function getChapters(subjectId?: string) {
  if (!subjectId) return [];
  return prisma.chapter.findMany({
    where: { subjectId },
    orderBy: { displayOrder: "asc" },
  });
}

export async function getAllChaptersBySubjectMap() {
  const chapters = await prisma.chapter.findMany({ orderBy: { displayOrder: "asc" } });
  const map = new Map<string, typeof chapters>();
  for (const c of chapters) {
    if (!map.has(c.subjectId)) map.set(c.subjectId, []);
    map.get(c.subjectId)!.push(c);
  }
  return map;
}
