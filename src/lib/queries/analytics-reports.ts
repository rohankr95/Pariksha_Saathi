import type { ClassLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BLOCKS, isBlockValue, type BlockValue } from "@/lib/blocks";
import {
  ACTIVITY_CTE,
  UTC_NOW,
  bucketExpr,
  bucketWindow,
  ist,
  type Granularity,
} from "@/lib/queries/analytics";

const CLASS_LEVELS: ClassLevel[] = ["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"];
const n = (v: bigint | number | null | undefined) => Number(v ?? 0);

// ---------------------------------------------------------------- students

export type ClassCounts = Record<ClassLevel, number>;
export type BlockClassRow = {
  /** A standard block value, or null for the "other / not set" bucket. */
  block: BlockValue | null;
  byClass: ClassCounts;
  total: number;
  active30d: number;
  neverActive: number;
};

const emptyClassCounts = (): ClassCounts => ({ CLASS_9: 0, CLASS_10: 0, CLASS_11: 0, CLASS_12: 0 });

/**
 * Registered students per block × class, with how many were active in the
 * last 30 days and how many have never done anything at all. Students whose
 * block isn't one of the six standard values are pooled into one row, so the
 * totals always reconcile with the overall student count.
 */
export async function getBlockClassReport(): Promise<{ rows: BlockClassRow[]; totals: BlockClassRow }> {
  const raw = await prisma.$queryRawUnsafe<
    { block: string | null; cl: string | null; total: bigint; active: bigint; never: bigint }[]
  >(`
    ${ACTIVITY_CTE},
    recent AS (SELECT DISTINCT "userId" FROM activity WHERE ts >= ${UTC_NOW} - interval '30 days'),
    ever AS (SELECT DISTINCT "userId" FROM activity)
    SELECT u."block" AS block, u."classLevel"::text AS cl,
           COUNT(*) AS total,
           COUNT(recent."userId") AS active,
           COUNT(*) - COUNT(ever."userId") AS never
    FROM "User" u
    LEFT JOIN recent ON recent."userId" = u.id
    LEFT JOIN ever ON ever."userId" = u.id
    WHERE u.role = 'STUDENT'::"Role"
    GROUP BY 1, 2
  `);

  const make = (block: BlockValue | null): BlockClassRow => ({
    block,
    byClass: emptyClassCounts(),
    total: 0,
    active30d: 0,
    neverActive: 0,
  });
  const rows = new Map<string, BlockClassRow>(BLOCKS.map((b) => [b.value, make(b.value)]));
  const other = make(null);
  const totals = make(null);

  for (const r of raw) {
    const row = isBlockValue(r.block) ? rows.get(r.block)! : other;
    for (const target of [row, totals]) {
      if (r.cl && (CLASS_LEVELS as string[]).includes(r.cl)) target.byClass[r.cl as ClassLevel] += n(r.total);
      target.total += n(r.total);
      target.active30d += n(r.active);
      target.neverActive += n(r.never);
    }
  }

  const list = [...rows.values()];
  if (other.total > 0) list.push(other);
  return { rows: list, totals };
}

export type ClassSummaryRow = {
  classLevel: ClassLevel;
  students: number;
  active30d: number;
  quizAttempts: number;
  avgAccuracy: number | null;
  watchHours: number;
};

/** One row per class: reach, recent activity, quiz performance and viewing. */
export async function getClassSummary(): Promise<ClassSummaryRow[]> {
  const rows = await prisma.$queryRawUnsafe<
    { cl: string; students: bigint; active: bigint; attempts: bigint; accuracy: number | null; secs: bigint | null }[]
  >(`
    ${ACTIVITY_CTE},
    recent AS (SELECT DISTINCT "userId" FROM activity WHERE ts >= ${UTC_NOW} - interval '30 days'),
    quiz AS (
      SELECT "studentId" AS uid, COUNT(*) AS attempts, AVG(accuracy) AS accuracy
      FROM "QuizAttempt" WHERE "submittedAt" IS NOT NULL GROUP BY 1
    ),
    watch AS (SELECT "userId" AS uid, SUM("watchedSeconds") AS secs FROM "LectureWatchProgress" GROUP BY 1)
    SELECT u."classLevel"::text AS cl,
           COUNT(*) AS students,
           COUNT(recent."userId") AS active,
           COALESCE(SUM(quiz.attempts), 0) AS attempts,
           SUM(quiz.accuracy * quiz.attempts) / NULLIF(SUM(quiz.attempts) FILTER (WHERE quiz.accuracy IS NOT NULL), 0) AS accuracy,
           COALESCE(SUM(watch.secs), 0) AS secs
    FROM "User" u
    LEFT JOIN recent ON recent."userId" = u.id
    LEFT JOIN quiz ON quiz.uid = u.id
    LEFT JOIN watch ON watch.uid = u.id
    WHERE u.role = 'STUDENT'::"Role" AND u."classLevel" IS NOT NULL
    GROUP BY 1
  `);
  const byClass = new Map(rows.map((r) => [r.cl, r]));
  return CLASS_LEVELS.map((cl) => {
    const r = byClass.get(cl);
    return {
      classLevel: cl,
      students: n(r?.students),
      active30d: n(r?.active),
      quizAttempts: n(r?.attempts),
      avgAccuracy: r?.accuracy == null ? null : Number(r.accuracy),
      watchHours: n(r?.secs) / 3600,
    };
  });
}

export type ActivityPeriodRow = { date: string; active: number; registrations: number; quizAttempts: number; viewers: number };

/**
 * The drill-down behind "active today / this week": per day or week, distinct
 * active students plus what they did. Optionally scoped to one block.
 */
export async function getActivityBreakdown(g: Granularity, periods: number, block?: BlockValue): Promise<ActivityPeriodRow[]> {
  const { keys, start } = bucketWindow(g, periods);
  const blockJoin = block ? `JOIN "User" bu ON bu.id = x.uid AND bu."block" = $1` : "";
  const params = block ? [block] : [];

  const series = (sql: string) => prisma.$queryRawUnsafe<{ key: string; count: bigint }[]>(sql, ...params);

  const [active, registrations, quizzes, viewers] = await Promise.all([
    series(`
      ${ACTIVITY_CTE}
      SELECT ${bucketExpr(g, "x.ts")} AS key, COUNT(DISTINCT x.uid) AS count
      FROM (SELECT "userId" AS uid, ts FROM activity) x ${blockJoin}
      WHERE ${ist("x.ts")} >= ${start}
      GROUP BY 1
    `),
    series(`
      SELECT ${bucketExpr(g, 'x."createdAt"')} AS key, COUNT(*) AS count
      FROM (SELECT id AS uid, "createdAt" FROM "User" WHERE role = 'STUDENT'::"Role") x ${blockJoin}
      WHERE ${ist('x."createdAt"')} >= ${start}
      GROUP BY 1
    `),
    series(`
      SELECT ${bucketExpr(g, 'x."startedAt"')} AS key, COUNT(*) AS count
      FROM (SELECT "studentId" AS uid, "startedAt" FROM "QuizAttempt") x ${blockJoin}
      WHERE ${ist('x."startedAt"')} >= ${start}
      GROUP BY 1
    `),
    series(`
      SELECT ${bucketExpr(g, 'x."updatedAt"')} AS key, COUNT(DISTINCT x.uid) AS count
      FROM (SELECT "userId" AS uid, "updatedAt" FROM "LectureWatchProgress") x ${blockJoin}
      WHERE ${ist('x."updatedAt"')} >= ${start}
      GROUP BY 1
    `),
  ]);

  const toMap = (rows: { key: string; count: bigint }[]) => new Map(rows.map((r) => [r.key, n(r.count)]));
  const [a, r, q, v] = [toMap(active), toMap(registrations), toMap(quizzes), toMap(viewers)];
  return keys.map((date) => ({
    date,
    active: a.get(date) ?? 0,
    registrations: r.get(date) ?? 0,
    quizAttempts: q.get(date) ?? 0,
    viewers: v.get(date) ?? 0,
  }));
}

export type SchoolRow = { school: string; students: number; active30d: number };

/** Schools with the most registrations. School is free text, so names are trimmed and compared case-insensitively. */
export async function getTopSchools(limit = 10): Promise<SchoolRow[]> {
  const rows = await prisma.$queryRawUnsafe<{ school: string; students: bigint; active: bigint }[]>(
    `
    ${ACTIVITY_CTE},
    recent AS (SELECT DISTINCT "userId" FROM activity WHERE ts >= ${UTC_NOW} - interval '30 days')
    SELECT MIN(btrim(u."school")) AS school, COUNT(*) AS students, COUNT(recent."userId") AS active
    FROM "User" u
    LEFT JOIN recent ON recent."userId" = u.id
    WHERE u.role = 'STUDENT'::"Role" AND u."school" IS NOT NULL AND btrim(u."school") <> ''
    GROUP BY lower(btrim(u."school"))
    ORDER BY students DESC, school ASC
    LIMIT $1
  `,
    limit
  );
  return rows.map((r) => ({ school: r.school, students: n(r.students), active30d: n(r.active) }));
}

// ---------------------------------------------------------------- videos

export async function getVideoTotals() {
  const [lectures, views, watch, notes, quizAttempts] = await Promise.all([
    prisma.lecture.count({ where: { deletedAt: null, isPublished: true } }),
    prisma.lecture.aggregate({ where: { deletedAt: null }, _sum: { views: true } }),
    prisma.$queryRawUnsafe<{ viewers: bigint; secs: bigint | null; completions: bigint; pairs: bigint }[]>(`
      SELECT COUNT(DISTINCT "userId") AS viewers, SUM("watchedSeconds") AS secs,
             COUNT(*) FILTER (WHERE watched) AS completions, COUNT(*) AS pairs
      FROM "LectureWatchProgress"
    `),
    prisma.note.aggregate({ where: { deletedAt: null }, _sum: { downloads: true } }),
    prisma.quizAttempt.count(),
  ]);
  const w = watch[0];
  return {
    publishedLectures: lectures,
    views: views._sum.views ?? 0,
    uniqueViewers: n(w?.viewers),
    watchHours: n(w?.secs) / 3600,
    completions: n(w?.completions),
    completionRate: n(w?.pairs) > 0 ? (n(w?.completions) / n(w?.pairs)) * 100 : null,
    noteDownloads: notes._sum.downloads ?? 0,
    quizAttempts,
  };
}

export const VIDEO_SORTS = ["views", "watch", "viewers", "completion", "newest"] as const;
export type VideoSort = (typeof VIDEO_SORTS)[number];

const VIDEO_ORDER: Record<VideoSort, string> = {
  views: `l.views DESC`,
  watch: `secs DESC`,
  viewers: `viewers DESC`,
  completion: `CASE WHEN viewers > 0 THEN done::float / viewers ELSE -1 END DESC`,
  newest: `l."createdAt" DESC`,
};

export type VideoTrafficRow = {
  id: string;
  title: string;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  durationSec: number | null;
  classLevel: ClassLevel;
  subjectHi: string;
  subjectEn: string;
  teacher: string;
  createdAt: Date;
  isPublished: boolean;
  views: number;
  viewers: number;
  watchHours: number;
  completions: number;
};

/** Every (non-deleted) lecture with its traffic, sortable and paged. */
export async function getVideoTraffic(params: { sort: VideoSort; page: number; pageSize?: number; classLevel?: ClassLevel }) {
  const pageSize = params.pageSize ?? 15;
  const where = `l."deletedAt" IS NULL${params.classLevel ? ` AND l."classLevel" = $3::"ClassLevel"` : ""}`;
  const args: unknown[] = [pageSize, (params.page - 1) * pageSize, ...(params.classLevel ? [params.classLevel] : [])];

  const [rows, count] = await Promise.all([
    prisma.$queryRawUnsafe<
      {
        id: string;
        title: string;
        youtubeUrl: string;
        thumbnailUrl: string | null;
        durationSec: number | null;
        classLevel: ClassLevel;
        subjectHi: string;
        subjectEn: string;
        teacher: string;
        createdAt: Date;
        isPublished: boolean;
        views: number;
        viewers: bigint;
        secs: bigint;
        done: bigint;
      }[]
    >(
      `
      SELECT l.id, l.title, l."youtubeUrl", l."thumbnailUrl", l."durationSec", l."classLevel",
             s."nameHi" AS "subjectHi", s."nameEn" AS "subjectEn", u.name AS teacher,
             l."createdAt", l."isPublished", l.views,
             COALESCE(w.viewers, 0) AS viewers, COALESCE(w.secs, 0) AS secs, COALESCE(w.done, 0) AS done
      FROM "Lecture" l
      JOIN "Subject" s ON s.id = l."subjectId"
      JOIN "User" u ON u.id = l."createdById"
      LEFT JOIN (
        SELECT "lectureId", COUNT(*) AS viewers, SUM("watchedSeconds") AS secs, COUNT(*) FILTER (WHERE watched) AS done
        FROM "LectureWatchProgress" GROUP BY 1
      ) w ON w."lectureId" = l.id
      WHERE ${where}
      ORDER BY ${VIDEO_ORDER[params.sort]}, l."createdAt" DESC
      LIMIT $1 OFFSET $2
    `,
      ...args
    ),
    params.classLevel
      ? prisma.lecture.count({ where: { deletedAt: null, classLevel: params.classLevel } })
      : prisma.lecture.count({ where: { deletedAt: null } }),
  ]);

  const items: VideoTrafficRow[] = rows.map((r) => ({
    ...r,
    viewers: n(r.viewers),
    watchHours: n(r.secs) / 3600,
    completions: n(r.done),
  }));
  return { items, total: count, totalPages: Math.max(1, Math.ceil(count / pageSize)) };
}

export type SubjectWatchRow = { subjectHi: string; subjectEn: string; lectures: number; views: number; viewers: number; watchHours: number };

/** Viewing per subject — where students are spending their study time. */
export async function getSubjectWatch(): Promise<SubjectWatchRow[]> {
  const rows = await prisma.$queryRawUnsafe<
    { subjectHi: string; subjectEn: string; lectures: bigint; views: bigint; viewers: bigint; secs: bigint }[]
  >(`
    WITH lec AS (
      SELECT "subjectId", COUNT(*) AS lectures, SUM(views) AS views
      FROM "Lecture" WHERE "deletedAt" IS NULL GROUP BY 1
    ),
    watch AS (
      SELECT l."subjectId", COUNT(DISTINCT w."userId") AS viewers, SUM(w."watchedSeconds") AS secs
      FROM "LectureWatchProgress" w
      JOIN "Lecture" l ON l.id = w."lectureId" AND l."deletedAt" IS NULL
      GROUP BY 1
    )
    SELECT s."nameHi" AS "subjectHi", s."nameEn" AS "subjectEn", lec.lectures, lec.views,
           COALESCE(watch.viewers, 0) AS viewers, COALESCE(watch.secs, 0) AS secs
    FROM lec
    JOIN "Subject" s ON s.id = lec."subjectId"
    LEFT JOIN watch ON watch."subjectId" = lec."subjectId"
    ORDER BY secs DESC, lec.views DESC
  `);
  return rows.map((r) => ({
    subjectHi: r.subjectHi,
    subjectEn: r.subjectEn,
    lectures: n(r.lectures),
    views: n(r.views),
    viewers: n(r.viewers),
    watchHours: n(r.secs) / 3600,
  }));
}

// ---------------------------------------------------------------- uploads

export type UploadPeriodRow = { date: string; lectures: number; notes: number; quizzes: number };

/** Content published into the portal per day or week (current, non-deleted items). */
export async function getUploadActivity(g: Granularity, periods: number): Promise<UploadPeriodRow[]> {
  const { keys, start } = bucketWindow(g, periods);
  const series = (table: string) =>
    prisma.$queryRawUnsafe<{ key: string; count: bigint }[]>(`
      SELECT ${bucketExpr(g, '"createdAt"')} AS key, COUNT(*) AS count
      FROM "${table}"
      WHERE ${table === "Quiz" ? "TRUE" : `"deletedAt" IS NULL`} AND ${ist('"createdAt"')} >= ${start}
      GROUP BY 1
    `);
  const [lectures, notes, quizzes] = await Promise.all([series("Lecture"), series("Note"), series("Quiz")]);
  const toMap = (rows: { key: string; count: bigint }[]) => new Map(rows.map((r) => [r.key, n(r.count)]));
  const [l, no, q] = [toMap(lectures), toMap(notes), toMap(quizzes)];
  return keys.map((date) => ({ date, lectures: l.get(date) ?? 0, notes: no.get(date) ?? 0, quizzes: q.get(date) ?? 0 }));
}

export type ContributorRow = {
  userId: string;
  name: string;
  role: string;
  lectures: number;
  notes: number;
  quizzes: number;
  lectureViews: number;
  lectureWatchHours: number;
  lastUpload: Date | null;
};

/** What each teacher/admin has published, and how much their lectures are actually watched. */
export async function getContributors(): Promise<ContributorRow[]> {
  const rows = await prisma.$queryRawUnsafe<
    {
      userId: string;
      name: string;
      role: string;
      lectures: bigint;
      notes: bigint;
      quizzes: bigint;
      views: bigint;
      secs: bigint;
      lastUpload: Date | null;
    }[]
  >(`
    WITH lec AS (
      SELECT l."createdById" AS uid, COUNT(*) AS lectures, SUM(l.views) AS views, MAX(l."createdAt") AS last,
             SUM(COALESCE(w.secs, 0)) AS secs
      FROM "Lecture" l
      LEFT JOIN (SELECT "lectureId", SUM("watchedSeconds") AS secs FROM "LectureWatchProgress" GROUP BY 1) w ON w."lectureId" = l.id
      WHERE l."deletedAt" IS NULL GROUP BY 1
    ),
    nt AS (SELECT "createdById" AS uid, COUNT(*) AS notes, MAX("createdAt") AS last FROM "Note" WHERE "deletedAt" IS NULL GROUP BY 1),
    qz AS (SELECT "createdById" AS uid, COUNT(*) AS quizzes, MAX("createdAt") AS last FROM "Quiz" GROUP BY 1)
    SELECT u.id AS "userId", u.name, u.role::text AS role,
           COALESCE(lec.lectures, 0) AS lectures, COALESCE(nt.notes, 0) AS notes, COALESCE(qz.quizzes, 0) AS quizzes,
           COALESCE(lec.views, 0) AS views, COALESCE(lec.secs, 0) AS secs,
           GREATEST(lec.last, nt.last, qz.last) AS "lastUpload"
    FROM "User" u
    LEFT JOIN lec ON lec.uid = u.id
    LEFT JOIN nt ON nt.uid = u.id
    LEFT JOIN qz ON qz.uid = u.id
    WHERE u.role IN ('TEACHER'::"Role", 'SUPER_ADMIN'::"Role")
      AND (u."isActive" OR lec.uid IS NOT NULL OR nt.uid IS NOT NULL OR qz.uid IS NOT NULL)
    ORDER BY (COALESCE(lec.lectures, 0) + COALESCE(nt.notes, 0) + COALESCE(qz.quizzes, 0)) DESC, u.name ASC
  `);
  return rows.map((r) => ({
    userId: r.userId,
    name: r.name,
    role: r.role,
    lectures: n(r.lectures),
    notes: n(r.notes),
    quizzes: n(r.quizzes),
    lectureViews: n(r.views),
    lectureWatchHours: n(r.secs) / 3600,
    lastUpload: r.lastUpload,
  }));
}
