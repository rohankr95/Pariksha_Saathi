import { prisma } from "@/lib/prisma";

// A student counts as "active" if they did any of these — there's no
// page-view/session log in this app, so utilization is measured by real
// learning actions rather than mere visits. Reused (as a CTE) by every
// query below that needs distinct active students in a time window.
export const ACTIVITY_CTE = `
  WITH activity AS (
    SELECT "studentId" AS "userId", "startedAt" AS ts FROM "QuizAttempt"
    UNION ALL SELECT "userId", "updatedAt" FROM "LectureWatchProgress"
    UNION ALL SELECT "studentId", "createdAt" FROM "DoubtBooking"
    UNION ALL SELECT "studentId", "submittedAt" FROM "AnswerCopy"
    UNION ALL SELECT "studentId", "createdAt" FROM "ClassRequest"
  )
`;

// Stored timestamps are zone-less UTC, so compare against UTC "now" explicitly
// rather than relying on the database session's TimeZone setting.
export const UTC_NOW = `(now() AT TIME ZONE 'UTC')`;

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
      SELECT '24h' AS window, COUNT(DISTINCT "userId") AS count FROM activity WHERE ts >= ${UTC_NOW} - interval '1 day'
      UNION ALL
      SELECT '7d' AS window, COUNT(DISTINCT "userId") AS count FROM activity WHERE ts >= ${UTC_NOW} - interval '7 days'
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
export type Granularity = "day" | "week";

// Columns are UTC timestamps without a zone; reports bucket by India time so
// a 1 AM study session counts on the day the student actually lived it.
export const ist = (col: string) => `(${col} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')`;

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * The bucket keys ("YYYY-MM-DD", oldest first) for the last `periods` days or
 * ISO weeks in India time, plus the SQL literal for the window's start.
 * Weeks start on Monday, matching Postgres's date_trunc('week', ...).
 */
export function bucketWindow(g: Granularity, periods: number) {
  const nowIst = new Date(Date.now() + 330 * 60 * 1000);
  const anchor = new Date(Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), nowIst.getUTCDate()));
  if (g === "week") {
    const dow = anchor.getUTCDay();
    anchor.setUTCDate(anchor.getUTCDate() - (dow === 0 ? 6 : dow - 1));
  }
  const step = g === "week" ? 7 : 1;
  const keys: string[] = [];
  for (let i = periods - 1; i >= 0; i--) {
    const d = new Date(anchor);
    d.setUTCDate(d.getUTCDate() - i * step);
    keys.push(toDateKey(d));
  }
  return { keys, start: `'${keys[0]}'::timestamp` };
}

export function bucketExpr(g: Granularity, col: string) {
  return `to_char(date_trunc('${g === "week" ? "week" : "day"}', ${ist(col)}), 'YYYY-MM-DD')`;
}

function fill(keys: string[], rows: { key: string; count: bigint | number }[]): TrendPoint[] {
  const byKey = new Map(rows.map((r) => [r.key, Number(r.count)]));
  return keys.map((date) => ({ date, count: byKey.get(date) ?? 0 }));
}

/** Distinct active students per day or week, oldest first, zero-filled. */
export async function getActiveUsersTrend(periods = 14, g: Granularity = "day"): Promise<TrendPoint[]> {
  const { keys, start } = bucketWindow(g, periods);
  const rows = await prisma.$queryRawUnsafe<{ key: string; count: bigint }[]>(`
    ${ACTIVITY_CTE}
    SELECT ${bucketExpr(g, "ts")} AS key, COUNT(DISTINCT "userId") AS count
    FROM activity
    WHERE ${ist("ts")} >= ${start}
    GROUP BY 1
  `);
  return fill(keys, rows);
}

/** New student registrations per day or week, oldest first, zero-filled. */
export async function getRegistrationTrend(periods = 14, g: Granularity = "day"): Promise<TrendPoint[]> {
  const { keys, start } = bucketWindow(g, periods);
  const rows = await prisma.$queryRawUnsafe<{ key: string; count: bigint }[]>(`
    SELECT ${bucketExpr(g, '"createdAt"')} AS key, COUNT(*) AS count
    FROM "User"
    WHERE role = 'STUDENT'::"Role" AND ${ist('"createdAt"')} >= ${start}
    GROUP BY 1
  `);
  return fill(keys, rows);
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
  const { keys, start } = bucketWindow("week", weeks);
  const rows = await prisma.$queryRawUnsafe<{ key: string; count: bigint }[]>(`
    SELECT ${bucketExpr("week", '"createdAt"')} AS key, COUNT(*) AS count
    FROM "DoubtBooking"
    WHERE ${ist('"createdAt"')} >= ${start}
    GROUP BY 1
  `);
  return fill(keys, rows);
}
