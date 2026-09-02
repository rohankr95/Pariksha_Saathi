import { prisma } from "@/lib/prisma";

const XP_BASE_PER_QUIZ = 10;

export type BadgeId =
  | "FIRST_QUIZ"
  | "QUIZ_10"
  | "QUIZ_25"
  | "STREAK_3"
  | "STREAK_7"
  | "STREAK_30"
  | "XP_100"
  | "XP_500"
  | "XP_1000"
  | "PERFECT_SCORE";

export const ALL_BADGES: BadgeId[] = [
  "FIRST_QUIZ",
  "QUIZ_10",
  "QUIZ_25",
  "STREAK_3",
  "STREAK_7",
  "STREAK_30",
  "XP_100",
  "XP_500",
  "XP_1000",
  "PERFECT_SCORE",
];

function istDateString(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/** Updates streak/XP/level/badges after a student submits a quiz attempt. */
export async function recordQuizActivity(studentId: string, result: { accuracy: number | null }) {
  const now = new Date();
  const today = istDateString(now);

  const existing = await prisma.studentStreak.upsert({
    where: { userId: studentId },
    update: {},
    create: { userId: studentId },
  });

  let currentStreak = existing.currentStreak;
  if (existing.lastActiveAt) {
    const lastDay = istDateString(existing.lastActiveAt);
    if (lastDay !== today) {
      const yesterday = istDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000));
      currentStreak = lastDay === yesterday ? currentStreak + 1 : 1;
    }
  } else {
    currentStreak = 1;
  }
  const longestStreak = Math.max(existing.longestStreak, currentStreak);

  const accuracyBonus = Math.floor((result.accuracy ?? 0) / 10);
  const xp = existing.xp + XP_BASE_PER_QUIZ + accuracyBonus;
  const level = Math.floor(xp / 100) + 1;

  const attemptsCount = await prisma.quizAttempt.count({ where: { studentId, submittedAt: { not: null } } });

  const earned = new Set(existing.badges as BadgeId[]);
  if (attemptsCount >= 1) earned.add("FIRST_QUIZ");
  if (attemptsCount >= 10) earned.add("QUIZ_10");
  if (attemptsCount >= 25) earned.add("QUIZ_25");
  if (currentStreak >= 3) earned.add("STREAK_3");
  if (currentStreak >= 7) earned.add("STREAK_7");
  if (currentStreak >= 30) earned.add("STREAK_30");
  if (xp >= 100) earned.add("XP_100");
  if (xp >= 500) earned.add("XP_500");
  if (xp >= 1000) earned.add("XP_1000");
  if ((result.accuracy ?? 0) >= 100) earned.add("PERFECT_SCORE");

  await prisma.studentStreak.update({
    where: { userId: studentId },
    data: {
      currentStreak,
      longestStreak,
      xp,
      level,
      lastActiveAt: now,
      badges: Array.from(earned),
    },
  });
}
