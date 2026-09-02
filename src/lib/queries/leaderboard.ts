import { prisma } from "@/lib/prisma";
import type { ClassLevel, LeaderboardPeriod } from "@prisma/client";

export type LeaderboardFilters = {
  period: LeaderboardPeriod;
  subjectId?: string;
  classLevel?: ClassLevel;
  school?: string;
  block?: string;
};

export type LeaderboardEntry = {
  studentId: string;
  rank: number;
  displayName: string;
  school: string;
  classLevel: ClassLevel | null;
  points: number;
  accuracy: number;
  avgTimeSec: number;
  quizzesAttempted: number;
};

function periodStart(period: LeaderboardPeriod): Date | null {
  const now = Date.now();
  if (period === "WEEKLY") return new Date(now - 7 * 24 * 60 * 60 * 1000);
  if (period === "MONTHLY") return new Date(now - 30 * 24 * 60 * 60 * 1000);
  return null;
}

export async function getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardEntry[]> {
  const since = periodStart(filters.period);

  const rows = await prisma.quizAttempt.groupBy({
    by: ["studentId"],
    where: {
      submittedAt: { not: null, ...(since ? { gte: since } : {}) },
      ...(filters.subjectId ? { quiz: { subjectId: filters.subjectId } } : {}),
      student: {
        onLeaderboard: true,
        isActive: true,
        ...(filters.classLevel ? { classLevel: filters.classLevel } : {}),
        ...(filters.school ? { school: filters.school } : {}),
        ...(filters.block ? { block: filters.block } : {}),
      },
    },
    _sum: { score: true },
    _avg: { accuracy: true, timeTakenSec: true },
    _count: { _all: true },
  });

  if (rows.length === 0) return [];

  const students = await prisma.user.findMany({
    where: { id: { in: rows.map((r) => r.studentId) } },
    select: { id: true, displayName: true, name: true, school: true, classLevel: true },
  });
  const byId = new Map(students.map((s) => [s.id, s]));

  const entries = rows.map((r) => {
    const s = byId.get(r.studentId);
    return {
      studentId: r.studentId,
      displayName: s?.displayName || s?.name || "विद्यार्थी",
      school: s?.school ?? "",
      classLevel: s?.classLevel ?? null,
      points: r._sum.score ?? 0,
      accuracy: Math.round(r._avg.accuracy ?? 0),
      avgTimeSec: Math.round(r._avg.timeTakenSec ?? 0),
      quizzesAttempted: r._count._all,
    };
  });

  entries.sort((a, b) => b.points - a.points || b.accuracy - a.accuracy || a.avgTimeSec - b.avgTimeSec);

  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
}

export async function getFilterOptions() {
  const [schools, blocks] = await Promise.all([
    prisma.user.findMany({ where: { role: "STUDENT", school: { not: null } }, select: { school: true }, distinct: ["school"] }),
    prisma.user.findMany({ where: { role: "STUDENT", block: { not: null } }, select: { block: true }, distinct: ["block"] }),
  ]);
  return {
    schools: schools.map((s) => s.school).filter((s): s is string => Boolean(s)),
    blocks: blocks.map((b) => b.block).filter((b): b is string => Boolean(b)),
  };
}
