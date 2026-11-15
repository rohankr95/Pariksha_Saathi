import type { AnswerCopyStatus, Prisma } from "@prisma/client";
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

const PENDING_STATUSES = ["SUBMITTED", "ASSIGNED", "UNDER_EVALUATION"] as const;

/** Teachers who have at least one answer copy assigned — for the Super Admin filter dropdown. */
export async function getAnswerCopyTeachers() {
  const groups = await prisma.answerCopy.groupBy({ by: ["teacherId"] });
  const ids = groups.map((g) => g.teacherId);
  if (ids.length === 0) return [];
  const teachers = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return teachers;
}

export async function getAnswerCopyStatusCounts() {
  const groups = await prisma.answerCopy.groupBy({ by: ["status"], _count: { _all: true } });
  const byStatus = new Map(groups.map((g) => [g.status, g._count._all]));
  const total = groups.reduce((sum, g) => sum + g._count._all, 0);
  const pending = PENDING_STATUSES.reduce((sum, s) => sum + (byStatus.get(s) ?? 0), 0);
  return { total, pending, checked: (byStatus.get("CHECKED") ?? 0) + (byStatus.get("RETURNED") ?? 0) };
}

/** Every answer-copy request for Super Admin, filterable by status / teacher / search and paged. */
export async function getAdminAnswerCopies(params: {
  status?: AnswerCopyStatus | "PENDING";
  teacherId?: string;
  q?: string;
  page: number;
  pageSize?: number;
}) {
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.AnswerCopyWhereInput = {
    ...(params.status === "PENDING"
      ? { status: { in: [...PENDING_STATUSES] } }
      : params.status
        ? { status: params.status }
        : {}),
    ...(params.teacherId ? { teacherId: params.teacherId } : {}),
    ...(params.q
      ? {
          OR: [
            { paperName: { contains: params.q, mode: "insensitive" } },
            { student: { name: { contains: params.q, mode: "insensitive" } } },
            { teacher: { name: { contains: params.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.answerCopy.findMany({
      where,
      include: {
        student: { select: { name: true, classLevel: true } },
        teacher: { select: { name: true } },
        subject: { select: { nameHi: true, nameEn: true } },
      },
      orderBy: { submittedAt: "desc" },
      skip: (params.page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.answerCopy.count({ where }),
  ]);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getAdminAnswerCopyOverview() {
  const [pendingByTeacher, avgTurnaround] = await Promise.all([
    prisma.answerCopy.groupBy({
      by: ["teacherId"],
      where: { status: { in: [...PENDING_STATUSES] } },
      _count: { _all: true },
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

  return { pending, turnaroundHours };
}
