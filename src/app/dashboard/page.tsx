import Link from "next/link";
import { Flame, Star, PlayCircle, Lightbulb, Target, Award, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { BadgeList } from "@/components/dashboard/badge-list";
import { requireUser } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { getSubjectWiseAccuracy } from "@/lib/queries/dashboard";
import { getT, getServerLocale } from "@/lib/i18n/server";

export default async function DashboardPage() {
  const t = await getT();
  const locale = await getServerLocale();
  const session = await requireUser();

  const [streak, lecturesWatched, attempts, subjectAccuracy] = await Promise.all([
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
      take: 8,
    }),
    getSubjectWiseAccuracy(session.user.id),
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

  const trend = [...attempts].reverse();

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

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 flex items-center gap-1.5 font-sans text-lg font-bold text-foreground">
            <Award className="h-5 w-5 text-[var(--color-section-quiz)]" /> {t("dashboard.badgesHeading")}
          </h2>
          <BadgeList earned={streak.badges} />
        </div>

        <div>
          <h2 className="mb-3 flex items-center gap-1.5 font-sans text-lg font-bold text-foreground">
            <BookOpen className="h-5 w-5 text-[var(--color-section-leaderboard)]" /> {t("dashboard.subjectSummaryHeading")}
          </h2>
          {subjectAccuracy.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("dashboard.noSubjectData")}</p>
          ) : (
            <Card className="space-y-3 p-4">
              {subjectAccuracy.map((s) => (
                <div key={s.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{locale === "hi" ? s.nameHi : s.nameEn}</span>
                    <span className="text-muted-foreground">{s.avgAccuracy}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full bg-[var(--color-section-leaderboard)]"
                      style={{ width: `${s.avgAccuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>

      {trend.length > 1 && (
        <div className="mt-8">
          <h2 className="mb-3 font-sans text-lg font-bold text-foreground">{t("dashboard.trendHeading")}</h2>
          <Card className="flex items-end gap-2 p-4" style={{ height: "120px" }}>
            {trend.map((a) => (
              <div key={a.id} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${a.accuracy ?? 0}%`}>
                <div
                  className="w-full rounded-t-[var(--radius-sm)] bg-[var(--color-section-quiz)]"
                  style={{ height: `${Math.max(4, a.accuracy ?? 0)}%` }}
                />
              </div>
            ))}
          </Card>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-3 font-sans text-lg font-bold text-foreground">{t("dashboard.recentQuizzesHeading")}</h2>
        {attempts.length > 0 ? (
          <div className="space-y-2">
            {attempts.slice(0, 5).map((a) => (
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
    </div>
  );
}
