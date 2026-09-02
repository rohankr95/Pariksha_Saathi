import { prisma } from "@/lib/prisma";

export async function getSubjectWiseAccuracy(studentId: string) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { studentId, submittedAt: { not: null }, accuracy: { not: null } },
    select: { accuracy: true, quiz: { select: { subject: { select: { id: true, nameHi: true, nameEn: true } } } } },
  });

  const bySubject = new Map<string, { nameHi: string; nameEn: string; total: number; count: number }>();
  for (const a of attempts) {
    const s = a.quiz.subject;
    const entry = bySubject.get(s.id) ?? { nameHi: s.nameHi, nameEn: s.nameEn, total: 0, count: 0 };
    entry.total += a.accuracy ?? 0;
    entry.count += 1;
    bySubject.set(s.id, entry);
  }

  return Array.from(bySubject.entries())
    .map(([id, v]) => ({
      id,
      nameHi: v.nameHi,
      nameEn: v.nameEn,
      avgAccuracy: Math.round(v.total / v.count),
      count: v.count,
    }))
    .sort((a, b) => b.avgAccuracy - a.avgAccuracy);
}
