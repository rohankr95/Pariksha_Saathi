import { prisma } from "@/lib/prisma";

// A student counts as "active" if they did any of these — there's no
// page-view/session log in this app, so utilization is measured by real
// learning actions rather than mere visits. Reused (as a CTE) by every
// query below that needs distinct active students in a time window.
const ACTIVITY_CTE = `
  WITH activity AS (
    SELECT "studentId" AS "userId", "startedAt" AS ts FROM "QuizAttempt"
    UNION ALL SELECT "userId", "updatedAt" FROM "LectureWatchProgress"
    UNION ALL SELECT "studentId", "createdAt" FROM "DoubtBooking"
    UNION ALL SELECT "studentId", "submittedAt" FROM "AnswerCopy"
    UNION ALL SELECT "studentId", "createdAt" FROM "ClassRequest"
  )
`;

export type AnalyticsOverview = Awaited<ReturnType<typeof getAnalyticsOverview>>;

export async function getAnalyticsOverview() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalStudents,
    totalTeachers,
    newStudentsThisWeek,
    doubtTotal,
    doubtUpcoming,
    doubtCompleted,
    doubtCancelledOrNoShow,
    copiesTotal,
    copiesChecked,
    copiesPending,
    watchSecondsAgg,
    quizAttempts,
    quizAvgAccuracy,
    classRequestsTotal,
    classRequestsPending,
    activeWindows,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.user.count({ where: { role: "STUDENT", createdAt: { gte: sevenDaysAgo } } }),
    prisma.doubtBooking.count(),
    prisma.doubtBooking.count({ where: { status: "BOOKED", slotStart: { gte: new Date() } } }),
    prisma.doubtBooking.count({ where: { status: "ATTENDED" } }),
    prisma.doubtBooking.count({ where: { status: { in: ["CANCELLED", "NO_SHOW"] } } }),
    prisma.answerCopy.count(),
    prisma.answerCopy.count({ where: { status: { in: ["CHECKED", "RETURNED"] } } }),
    prisma.answerCopy.count({ where: { status: { in: ["SUBMITTED", "ASSIGNED", "UNDER_EVALUATION"] } } }),
    prisma.lectureWatchProgress.aggregate({ _sum: { watchedSeconds: true } }),
    prisma.quizAttempt.count({ where: { submittedAt: { not: null } } }),
    prisma.quizAttempt.aggregate({ where: { accuracy: { not: null } }, _avg: { accuracy: true } }),
    prisma.classRequest.count(),
    prisma.classRequest.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    prisma.$queryRawUnsafe<{ window: string; count: bigint }[]>(`
      ${ACTIVITY_CTE}
      SELECT '24h' AS window, COUNT(DISTINCT "userId") AS count FROM activity WHERE ts >= now() - interval '1 day'
      UNION ALL
      SELECT '7d' AS window, COUNT(DISTINCT "userId") AS count FROM activity WHERE ts >= now() - interval '7 days'
    `),
  ]);

  const dau = Number(activeWindows.find((w) => w.window === "24h")?.count ?? 0);
  const wau = Number(activeWindows.find((w) => w.window === "7d")?.count ?? 0);

  return {
    totalStudents,
    totalTeachers,
    newStudentsThisWeek,
    dau,
    wau,
    doubtClasses: {
      total: doubtTotal,
      upcoming: doubtUpcoming,
      completed: doubtCompleted,
      cancelledOrNoShow: doubtCancelledOrNoShow,
    },
    answerCopies: {
      total: copiesTotal,
      checked: copiesChecked,
      pending: copiesPending,
    },
    watchHours: (watchSecondsAgg._sum.watchedSeconds ?? 0) / 3600,
    quiz: {
      totalAttempts: quizAttempts,
      avgAccuracy: quizAvgAccuracy._avg.accuracy ?? null,
    },
    classRequests: {
      total: classRequestsTotal,
      pending: classRequestsPending,
    },
  };
}

export type TrendPoint = { date: string; count: number };

/** Distinct active students per day, oldest first, zero-filled for silent days. */
export async function getActiveUsersTrend(days = 14): Promise<TrendPoint[]> {
  const rows = await prisma.$queryRawUnsafe<{ day: Date; count: bigint }[]>(`
    ${ACTIVITY_CTE}
    SELECT date_trunc('day', ts) AS day, COUNT(DISTINCT "userId") AS count
    FROM activity
    WHERE ts >= now() - interval '${days} days'
    GROUP BY day
    ORDER BY day ASC
  `);
  return zeroFillDaily(rows, days);
}

/** New student registrations per day, oldest first, zero-filled for silent days. */
export async function getRegistrationTrend(days = 14): Promise<TrendPoint[]> {
  const rows = await prisma.$queryRawUnsafe<{ day: Date; count: bigint }[]>(`
    SELECT date_trunc('day', "createdAt") AS day, COUNT(*) AS count
    FROM "User"
    WHERE role = 'STUDENT'::"Role" AND "createdAt" >= now() - interval '${days} days'
    GROUP BY day
    ORDER BY day ASC
  `);
  return zeroFillDaily(rows, days);
}

function zeroFillDaily(rows: { day: Date; count: bigint }[], days: number): TrendPoint[] {
  const byDate = new Map(rows.map((r) => [toDateKey(r.day), Number(r.count)]));
  const out: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    out.push({ date: key, count: byDate.get(key) ?? 0 });
  }
  return out;
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Monday of the ISO week containing `d`, matching Postgres's date_trunc('week', ...). */
function mondayOf(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function zeroFillWeekly(rows: { week: Date; count: bigint }[], weeks: number): TrendPoint[] {
  const byWeek = new Map(rows.map((r) => [toDateKey(r.week), Number(r.count)]));
  const out: TrendPoint[] = [];
  const thisMonday = mondayOf(new Date());
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(thisMonday);
    d.setDate(d.getDate() - i * 7);
    const key = toDateKey(d);
    out.push({ date: key, count: byWeek.get(key) ?? 0 });
  }
  return out;
}

export type BlockEngagement = { block: string; totalStudents: number; activeLast30d: number };

/** Registered vs. recently-active students per block — surfaces which blocks the portal isn't reaching. */
export async function getBlockEngagement(): Promise<BlockEngagement[]> {
  const rows = await prisma.$queryRawUnsafe<{ block: string; total: bigint; active: bigint }[]>(`
    ${ACTIVITY_CTE}
    SELECT u."block" AS block, COUNT(DISTINCT u.id) AS total, COUNT(DISTINCT a."userId") AS active
    FROM "User" u
    LEFT JOIN activity a ON a."userId" = u.id AND a.ts >= now() - interval '30 days'
    WHERE u.role = 'STUDENT'::"Role" AND u."block" IS NOT NULL
    GROUP BY u."block"
    ORDER BY total DESC
  `);
  return rows.map((r) => ({ block: r.block, totalStudents: Number(r.total), activeLast30d: Number(r.active) }));
}

export type TeacherWorkload = {
  teacherId: string;
  name: string;
  doubtClassesTaken: number;
  answerCopiesChecked: number;
};

/** Per-teacher load — doubt classes actually taken and answer copies actually checked. */
export async function getTeacherWorkload(): Promise<TeacherWorkload[]> {
  const [doubtGroups, copyGroups] = await Promise.all([
    prisma.doubtBooking.groupBy({ by: ["teacherId"], where: { status: "ATTENDED" }, _count: { _all: true } }),
    prisma.answerCopy.groupBy({ by: ["teacherId"], where: { status: { in: ["CHECKED", "RETURNED"] } }, _count: { _all: true } }),
  ]);

  const teacherIds = Array.from(new Set([...doubtGroups.map((g) => g.teacherId), ...copyGroups.map((g) => g.teacherId)]));
  const teachers = await prisma.user.findMany({ where: { id: { in: teacherIds } }, select: { id: true, name: true } });
  const nameById = new Map(teachers.map((t) => [t.id, t.name]));

  const doubtByTeacher = new Map(doubtGroups.map((g) => [g.teacherId, g._count._all]));
  const copiesByTeacher = new Map(copyGroups.map((g) => [g.teacherId, g._count._all]));

  return teacherIds
    .map((id) => ({
      teacherId: id,
      name: nameById.get(id) ?? "—",
      doubtClassesTaken: doubtByTeacher.get(id) ?? 0,
      answerCopiesChecked: copiesByTeacher.get(id) ?? 0,
    }))
    .sort((a, b) => b.doubtClassesTaken + b.answerCopiesChecked - (a.doubtClassesTaken + a.answerCopiesChecked));
}

export type TopLecture = { lectureId: string; title: string; watchHours: number; views: number };

/** Lectures ranked by actual accumulated watch time (not just page-views). */
export async function getTopLecturesByWatchTime(limit = 5): Promise<TopLecture[]> {
  const groups = await prisma.lectureWatchProgress.groupBy({
    by: ["lectureId"],
    _sum: { watchedSeconds: true },
    orderBy: { _sum: { watchedSeconds: "desc" } },
    take: limit,
  });
  const lectureIds = groups.map((g) => g.lectureId);
  const lectures = await prisma.lecture.findMany({
    where: { id: { in: lectureIds } },
    select: { id: true, title: true, views: true },
  });
  const byId = new Map(lectures.map((l) => [l.id, l]));

  return groups
    .map((g) => {
      const lecture = byId.get(g.lectureId);
      return {
        lectureId: g.lectureId,
        title: lecture?.title ?? "—",
        watchHours: (g._sum.watchedSeconds ?? 0) / 3600,
        views: lecture?.views ?? 0,
      };
    })
    .filter((l) => l.watchHours > 0);
}

/** New doubt-class bookings per week, oldest first. */
export async function getDoubtClassWeeklyTrend(weeks = 8): Promise<TrendPoint[]> {
  const rows = await prisma.$queryRawUnsafe<{ week: Date; count: bigint }[]>(`
    SELECT date_trunc('week', "createdAt") AS week, COUNT(*) AS count
    FROM "DoubtBooking"
    WHERE "createdAt" >= now() - interval '${weeks} weeks'
    GROUP BY week
    ORDER BY week ASC
  `);
  return zeroFillWeekly(rows, weeks);
}
