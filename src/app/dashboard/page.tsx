import Link from "next/link";
import { Flame, Star, PlayCircle, Lightbulb, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";

export default async function DashboardPage() {
  const t = await getT();
  const session = await requireUser();

  const [streak, lecturesWatched, attempts] = await Promise.all([
    prisma.studentStreak.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    }),
    prisma.lectureWatchProgress.count({ where: { userId: session.user.id, watched: true } }),
    prisma.quizAttempt.findMany({
      where: { studentId: session.user.id, submittedAt: { not: null } },
      include: { quiz: { select: { title: true } } },
      orderBy: { submittedAt: "desc" },
      take: 5,
    }),
  ]);

  const avgAccuracy =
    attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + (a.accuracy ?? 0), 0) / attempts.length)
      : 0;

  const cards = [
    { label: t("dashboard.streak"), value: t("dashboard.streakDays", { count: streak.currentStreak }), icon: Flame, color: "--color-section-stories" },
    { label: t("dashboard.xp"), value: streak.xp, icon: Star, color: "--color-section-quiz" },
    { label: t("dashboard.lecturesWatched"), value: lecturesWatched, icon: PlayCircle, color: "--color-section-lectures" },
    { label: t("dashboard.avgAccuracy"), value: `${avgAccuracy}%`, icon: Target, color: "--color-section-leaderboard" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-sans text-2xl font-bold text-foreground">
        {t("dashboard.greeting", { name: session.user.displayName || session.user.name?.split(" ")[0] || "" })}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-4 text-center">
              <span
                className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  backgroundColor: `color-mix(in srgb, var(${card.color}) 15%, transparent)`,
                  color: `var(${card.color})`,
                }}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-2 text-xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-sans text-lg font-bold text-foreground">{t("dashboard.recentQuizzesHeading")}</h2>
        {attempts.length > 0 ? (
          <div className="space-y-2">
            {attempts.map((a) => (
              <Link
                key={a.id}
                href={`/quiz/${a.quizId}/result/${a.id}`}
                className="flex items-center justify-between rounded-[var(--radius-md)] border border-border p-3 text-sm hover:bg-surface-muted"
              >
                <span className="truncate">{a.quiz.title}</span>
                <span className="shrink-0 font-semibold text-primary">{t("dashboard.scoreLine", { score: a.score ?? 0, accuracy: a.accuracy ?? 0 })}</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Lightbulb}
            title={t("dashboard.noAttemptsTitle")}
            description={t("dashboard.noAttemptsDesc")}
            action={
              <Link href="/quiz" className="text-sm font-medium text-primary hover:underline">
                {t("dashboard.browseQuizzes")}
              </Link>
            }
          />
        )}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">{t("dashboard.futurePhaseNote")}</p>
    </div>
  );
}
