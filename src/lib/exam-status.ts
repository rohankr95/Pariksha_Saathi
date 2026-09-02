import type { ExamStatus } from "@prisma/client";

type ExamDates = {
  applyStart: Date | null;
  applyEnd: Date | null;
  examDate: Date | null;
};

/** Status is derived from dates, never trusted as manually set — see spec: "auto-computed from dates". */
export function computeExamStatus(exam: ExamDates, now: Date = new Date()): ExamStatus {
  if (exam.examDate && now > exam.examDate) return "CLOSED";
  if (exam.applyEnd && now > exam.applyEnd) return "ONGOING";
  if (exam.applyStart && now < exam.applyStart) return "UPCOMING";
  return "UPCOMING";
}

export function daysUntil(date: Date | null, now: Date = new Date()): number | null {
  if (!date) return null;
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatIST(date: Date | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("hi-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
    ...opts,
  }).format(date);
}
