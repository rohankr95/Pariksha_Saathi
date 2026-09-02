import { prisma } from "@/lib/prisma";

export async function getMyClassRequests(studentId: string) {
  return prisma.classRequest.findMany({
    where: { studentId },
    include: { subject: true, preferredTeacher: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/** Feed of other students' open requests — so a student can upvote instead of duplicating. */
export async function getOpenClassRequestFeed(excludeStudentId?: string) {
  return prisma.classRequest.findMany({
    where: {
      status: { in: ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED"] },
      ...(excludeStudentId ? { studentId: { not: excludeStudentId } } : {}),
    },
    include: { subject: true, preferredTeacher: { select: { name: true } } },
    orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
    take: 30,
  });
}

export async function findSimilarOpenRequest(subjectId: string, chapter: string, classLevel: string) {
  const normalizedChapter = chapter.trim().toLowerCase();
  if (!normalizedChapter) return null;

  const candidates = await prisma.classRequest.findMany({
    where: {
      subjectId,
      classLevel: classLevel as never,
      status: { in: ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED"] },
    },
  });
  return candidates.find((c) => (c.chapter ?? "").trim().toLowerCase() === normalizedChapter) ?? null;
}

