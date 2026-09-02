import { prisma } from "@/lib/prisma";

export function getSubjectTeachers(subjectId: string) {
  return prisma.user.findMany({
    where: { role: "TEACHER", isActive: true, subjects: { some: { id: subjectId } } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export function getMyAnswerCopies(studentId: string) {
  return prisma.answerCopy.findMany({
    where: { studentId },
    include: { teacher: { select: { name: true } }, subject: { select: { nameHi: true } } },
    orderBy: { submittedAt: "desc" },
  });
}

/** Counts submissions in the rolling 7 days, for weekly-limit enforcement. */
export async function countRecentSubmissions(studentId: string) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return prisma.answerCopy.count({ where: { studentId, submittedAt: { gte: since } } });
}

export function getTeacherAnswerCopyQueue(teacherId: string) {
  return prisma.answerCopy.findMany({
    where: { teacherId, status: { in: ["SUBMITTED", "ASSIGNED", "UNDER_EVALUATION"] } },
    include: { student: { select: { name: true, classLevel: true } }, subject: { select: { nameHi: true } } },
    orderBy: { submittedAt: "asc" },
  });
}

export function getTeacherCheckedCopies(teacherId: string) {
  return prisma.answerCopy.findMany({
    where: { teacherId, status: { in: ["CHECKED", "RETURNED"] } },
    include: { student: { select: { name: true, classLevel: true } }, subject: { select: { nameHi: true } } },
    orderBy: { checkedAt: "desc" },
    take: 30,
  });
}

export async function getAdminAnswerCopyOverview() {
  const [pendingByTeacher, recent, avgTurnaround] = await Promise.all([
    prisma.answerCopy.groupBy({
      by: ["teacherId"],
      where: { status: { in: ["SUBMITTED", "ASSIGNED", "UNDER_EVALUATION"] } },
      _count: { _all: true },
    }),
    prisma.answerCopy.findMany({
      include: { student: { select: { name: true } }, teacher: { select: { name: true } }, subject: { select: { nameHi: true } } },
      orderBy: { submittedAt: "desc" },
      take: 30,
    }),
    prisma.answerCopy.findMany({
      where: { status: { in: ["CHECKED", "RETURNED"] }, checkedAt: { not: null } },
      select: { submittedAt: true, checkedAt: true },
    }),
  ]);

  const teacherIds = pendingByTeacher.map((p) => p.teacherId);
  const teachers = teacherIds.length
    ? await prisma.user.findMany({ where: { id: { in: teacherIds } }, select: { id: true, name: true } })
    : [];
  const teacherNameById = new Map(teachers.map((t) => [t.id, t.name]));

  const pending = pendingByTeacher.map((p) => ({
    teacherId: p.teacherId,
    teacherName: teacherNameById.get(p.teacherId) ?? "—",
    count: p._count._all,
  }));

  const turnaroundHours = avgTurnaround.length
    ? avgTurnaround.reduce((sum, c) => sum + (c.checkedAt!.getTime() - c.submittedAt.getTime()) / 3600000, 0) / avgTurnaround.length
    : null;

  return { pending, recent, turnaroundHours };
}
