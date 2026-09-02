import { prisma } from "@/lib/prisma";
import { getLeaderboard } from "@/lib/queries/leaderboard";

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
  const entries = await getLeaderboard({ period: "ALL_TIME" });
  return entries.slice(0, 3).map((e) => ({
    rank: e.rank,
    studentId: e.studentId,
    name: e.displayName,
    school: e.school,
    points: e.points,
    accuracy: e.accuracy,
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
