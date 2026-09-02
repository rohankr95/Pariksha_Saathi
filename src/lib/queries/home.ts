import { prisma } from "@/lib/prisma";

export async function getHomeStats() {
  const [students, lectures, doubtsResolved, quizAttempts] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
    prisma.lecture.count({ where: { isPublished: true } }),
    prisma.doubtBooking.count({ where: { status: "ATTENDED" } }),
    prisma.quizAttempt.count({ where: { submittedAt: { not: null } } }),
  ]);
  return { students, lectures, doubtsResolved, quizAttempts };
}

export async function getActiveAnnouncements() {
  return prisma.announcement.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

export async function getFeaturedStory() {
  return prisma.story.findFirst({
    where: { isPublished: true, isFeatured: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getLeaderboardPreview() {
  const grouped = await prisma.quizAttempt.groupBy({
    by: ["studentId"],
    where: { submittedAt: { not: null } },
    _sum: { score: true },
    _avg: { accuracy: true },
    orderBy: { _sum: { score: "desc" } },
    take: 3,
  });

  if (grouped.length === 0) return [];

  const students = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.studentId) }, onLeaderboard: true },
    select: { id: true, displayName: true, name: true, school: true },
  });
  const byId = new Map(students.map((s) => [s.id, s]));

  return grouped
    .filter((g) => byId.has(g.studentId))
    .map((g, i) => ({
      rank: i + 1,
      studentId: g.studentId,
      name: byId.get(g.studentId)?.displayName || byId.get(g.studentId)?.name || "विद्यार्थी",
      school: byId.get(g.studentId)?.school ?? "",
      points: g._sum.score ?? 0,
      accuracy: Math.round(g._avg.accuracy ?? 0),
    }));
}

export async function getNearestExamDeadline() {
  return prisma.exam.findFirst({
    where: { isPublished: true, applyEnd: { gte: new Date() } },
    orderBy: { applyEnd: "asc" },
  });
}

export async function getStudentPersonalisation(userId: string) {
  const [nextBooking, pendingAnswerCopy, continueLecture] = await Promise.all([
    prisma.doubtBooking.findFirst({
      where: { studentId: userId, status: "BOOKED", slotStart: { gte: new Date() } },
      orderBy: { slotStart: "asc" },
      include: { teacher: { select: { name: true } } },
    }),
    prisma.answerCopy.findFirst({
      where: { studentId: userId, status: { not: "RETURNED" } },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.lectureWatchProgress.findFirst({
      where: { userId, watched: false },
      orderBy: { updatedAt: "desc" },
      include: { lecture: { select: { title: true, id: true } } },
    }),
  ]);
  return { nextBooking, pendingAnswerCopy, continueLecture };
}
