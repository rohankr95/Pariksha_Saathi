import {
  GraduationCap,
  UserPlus,
  Users,
  Zap,
  Activity,
  PlayCircle,
  MessageCircleQuestion,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck2,
  AlertTriangle,
  Lightbulb,
  Target,
  HandHelping,
} from "lucide-react";
import { requireRole } from "@/lib/require-role";
import { getT } from "@/lib/i18n/server";
import { StatTile, StatGroup } from "@/components/admin/analytics/stat-tile";
import { TrendLineChart } from "@/components/admin/analytics/trend-line-chart";
import { TrendBarChart } from "@/components/admin/analytics/trend-bar-chart";
import {
  getAnalyticsOverview,
  getActiveUsersTrend,
  getRegistrationTrend,
  getDoubtClassWeeklyTrend,
  getBlockEngagement,
  getTopLecturesByWatchTime,
  getTeacherWorkload,
} from "@/lib/queries/analytics";

export default async function AdminAnalyticsPage() {
  await requireRole(["SUPER_ADMIN"]);
  const t = await getT();

  const [overview, activeTrend, registrationTrend, doubtWeekly, blocks, topLectures, teacherWorkload] = await Promise.all([
    getAnalyticsOverview(),
    getActiveUsersTrend(14),
    getRegistrationTrend(14),
    getDoubtClassWeeklyTrend(8),
    getBlockEngagement(),
    getTopLecturesByWatchTime(5),
    getTeacherWorkload(),
  ]);

  const accuracyLabel =
    overview.quiz.avgAccuracy === null ? "—" : `${Math.round(overview.quiz.avgAccuracy)}%`;

  return (
    <div>
      <h1 className="font-sans text-2xl font-bold text-foreground">{t("analytics.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("analytics.subtitle")}</p>

      <StatGroup title={t("analytics.groupReach")}>
        <StatTile label={t("analytics.totalStudents")} value={overview.totalStudents} icon={GraduationCap} color="--color-section-quiz" />
        <StatTile label={t("analytics.newStudentsThisWeek")} value={overview.newStudentsThisWeek} icon={UserPlus} color="--color-section-lectures" />
        <StatTile label={t("analytics.totalTeachers")} value={overview.totalTeachers} icon={Users} color="--color-section-career" />
      </StatGroup>

      <StatGroup title={t("analytics.groupEngagement")}>
        <StatTile
          label={t("analytics.activeToday")}
          value={overview.dau}
          sublabel={t("analytics.activeSublabel")}
          icon={Zap}
          color="--success"
        />
        <StatTile
          label={t("analytics.activeThisWeek")}
          value={overview.wau}
          sublabel={t("analytics.activeSublabel")}
          icon={Activity}
          color="--success"
        />
        <StatTile
          label={t("analytics.watchHours")}
          value={overview.watchHours.toFixed(1)}
          sublabel={t("analytics.watchHoursSublabel")}
          icon={PlayCircle}
          color="--color-section-lectures"
        />
      </StatGroup>

      <StatGroup title={t("analytics.groupDoubtClasses")}>
        <StatTile label={t("analytics.doubtTotal")} value={overview.doubtClasses.total} icon={MessageCircleQuestion} color="--color-section-doubtclass" />
        <StatTile label={t("analytics.doubtUpcoming")} value={overview.doubtClasses.upcoming} icon={Clock} color="--color-section-doubtclass" />
        <StatTile label={t("analytics.doubtCompleted")} value={overview.doubtClasses.completed} icon={CheckCircle2} color="--success" />
        <StatTile label={t("analytics.doubtCancelled")} value={overview.doubtClasses.cancelledOrNoShow} icon={XCircle} color="--color-section-examdates" />
      </StatGroup>

      <StatGroup title={t("analytics.groupAnswerCopies")}>
        <StatTile label={t("analytics.copiesTotal")} value={overview.answerCopies.total} icon={FileCheck2} color="--color-section-answercopies" />
        <StatTile label={t("analytics.copiesChecked")} value={overview.answerCopies.checked} icon={CheckCircle2} color="--success" />
        <StatTile label={t("analytics.copiesPending")} value={overview.answerCopies.pending} icon={AlertTriangle} color="--color-section-examdates" />
      </StatGroup>

      <StatGroup title={t("analytics.groupQuizRequests")}>
        <StatTile label={t("analytics.quizAttempts")} value={overview.quiz.totalAttempts} icon={Lightbulb} color="--color-section-quiz" />
        <StatTile label={t("analytics.quizAvgAccuracy")} value={accuracyLabel} icon={Target} color="--color-section-quiz" />
        <StatTile label={t("analytics.classRequestsTotal")} value={overview.classRequests.total} icon={HandHelping} color="--color-section-classrequest" />
        <StatTile label={t("analytics.classRequestsPending")} value={overview.classRequests.pending} icon={AlertTriangle} color="--color-section-examdates" />
      </StatGroup>

      <section className="mt-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <TrendLineChart data={activeTrend} color="var(--success)" caption={t("analytics.chartActiveUsers")} />
          <TrendBarChart data={registrationTrend} color="var(--color-section-lectures)" caption={t("analytics.chartRegistrations")} />
        </div>
        <div className="mt-4">
          <TrendBarChart data={doubtWeekly} color="var(--color-section-doubtclass)" caption={t("analytics.chartDoubtWeekly")} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-sans text-lg font-bold text-foreground">{t("analytics.blockEngagementTitle")}</h2>
        <p className="mb-3 text-xs text-muted-foreground">{t("analytics.blockEngagementNote")}</p>
        {blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("analytics.noData")}</p>
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
                <tr>
                  <th className="p-3">{t("analytics.colBlock")}</th>
                  <th className="p-3">{t("analytics.colTotalStudents")}</th>
                  <th className="p-3">{t("analytics.colActive30d")}</th>
                  <th className="p-3">{t("analytics.colActiveShare")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {blocks.map((b) => {
                  const share = b.totalStudents > 0 ? Math.round((b.activeLast30d / b.totalStudents) * 100) : 0;
                  return (
                    <tr key={b.block}>
                      <td className="p-3 font-medium">{b.block}</td>
                      <td className="p-3">{b.totalStudents}</td>
                      <td className="p-3">{b.activeLast30d}</td>
                      <td className="p-3">
                        <span
                          className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{
                            backgroundColor:
                              share >= 40
                                ? "color-mix(in srgb, var(--success) 15%, transparent)"
                                : "color-mix(in srgb, var(--color-section-examdates) 15%, transparent)",
                            color: share >= 40 ? "var(--success)" : "var(--color-section-examdates)",
                          }}
                        >
                          {share}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-sans text-lg font-bold text-foreground">{t("analytics.topLecturesTitle")}</h2>
          <p className="mb-3 text-xs text-muted-foreground">{t("analytics.topLecturesNote")}</p>
          {topLectures.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("analytics.noData")}</p>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="p-3">{t("analytics.colLecture")}</th>
                    <th className="p-3">{t("analytics.colWatchHours")}</th>
                    <th className="p-3">{t("analytics.colViews")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topLectures.map((l) => (
                    <tr key={l.lectureId}>
                      <td className="max-w-xs truncate p-3 font-medium">{l.title}</td>
                      <td className="p-3">{l.watchHours.toFixed(1)}</td>
                      <td className="p-3 text-muted-foreground">{l.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-sans text-lg font-bold text-foreground">{t("analytics.teacherWorkloadTitle")}</h2>
          {teacherWorkload.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("analytics.noData")}</p>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="p-3">{t("analytics.colTeacher")}</th>
                    <th className="p-3">{t("analytics.colDoubtTaken")}</th>
                    <th className="p-3">{t("analytics.colCopiesChecked")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {teacherWorkload.map((tw) => (
                    <tr key={tw.teacherId}>
                      <td className="p-3 font-medium">{tw.name}</td>
                      <td className="p-3">{tw.doubtClassesTaken}</td>
                      <td className="p-3">{tw.answerCopiesChecked}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
