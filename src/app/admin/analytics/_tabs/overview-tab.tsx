import Link from "next/link";
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
import { StatTile, StatGroup } from "@/components/admin/analytics/stat-tile";
import { TrendLineChart } from "@/components/admin/analytics/trend-line-chart";
import { TrendBarChart } from "@/components/admin/analytics/trend-bar-chart";
import {
  getAnalyticsOverview,
  getActiveUsersTrend,
  getRegistrationTrend,
  getDoubtClassWeeklyTrend,
  getTopLecturesByWatchTime,
  getTeacherWorkload,
} from "@/lib/queries/analytics";
import { DataTable, SectionTitle, Td } from "./controls";
import { reportHref, type ReportParams } from "./params";

type T = (key: string, vars?: Record<string, string | number>) => string;

export async function OverviewTab({ t, params }: { t: T; params: ReportParams }) {
  const [overview, activeTrend, registrationTrend, doubtWeekly, topLectures, teacherWorkload] = await Promise.all([
    getAnalyticsOverview(),
    getActiveUsersTrend(14),
    getRegistrationTrend(14),
    getDoubtClassWeeklyTrend(8),
    getTopLecturesByWatchTime(5),
    getTeacherWorkload(),
  ]);

  const accuracyLabel = overview.quiz.avgAccuracy === null ? "—" : `${Math.round(overview.quiz.avgAccuracy)}%`;
  const drill = (g: "day" | "week") => reportHref(params, { tab: "activity", g, n: g === "day" ? 14 : 12, page: undefined });

  return (
    <>
      <StatGroup title={t("analytics.groupReach")}>
        <StatTile
          label={t("analytics.totalStudents")}
          value={overview.totalStudents}
          icon={GraduationCap}
          color="--color-section-quiz"
          href={reportHref(params, { tab: "students", page: undefined })}
          linkLabel={t("analytics.tabs.students")}
        />
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
          href={drill("day")}
          linkLabel={t("analytics.viewDrilldown")}
        />
        <StatTile
          label={t("analytics.activeThisWeek")}
          value={overview.wau}
          sublabel={t("analytics.activeSublabel")}
          icon={Activity}
          color="--success"
          href={drill("week")}
          linkLabel={t("analytics.viewDrilldown")}
        />
        <StatTile
          label={t("analytics.watchHours")}
          value={overview.watchHours.toFixed(1)}
          sublabel={t("analytics.watchHoursSublabel")}
          icon={PlayCircle}
          color="--color-section-lectures"
          href={reportHref(params, { tab: "videos", page: undefined })}
          linkLabel={t("analytics.tabs.videos")}
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

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <TrendLineChart
          data={activeTrend}
          color="var(--success)"
          caption={t("analytics.chartActiveUsers")}
          valueLabel={t("analytics.activeStudentsLabel")}
        />
        <TrendBarChart
          data={registrationTrend}
          color="var(--color-section-lectures)"
          caption={t("analytics.chartRegistrations")}
          valueLabel={t("analytics.registrationsLabel")}
        />
        <div className="lg:col-span-2">
          <TrendBarChart
            data={doubtWeekly}
            color="var(--color-section-doubtclass)"
            caption={t("analytics.chartDoubtWeekly")}
            valueLabel={t("analytics.doubtTotal")}
            weekly
            wide
          />
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <SectionTitle title={t("analytics.topLecturesTitle")} note={t("analytics.topLecturesNote")} />
          {topLectures.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("analytics.noData")}</p>
          ) : (
            <DataTable head={[t("analytics.colLecture"), t("analytics.colWatchHours"), t("analytics.colViews")]}>
              {topLectures.map((l) => (
                <tr key={l.lectureId}>
                  <Td className="max-w-xs truncate font-medium">
                    <Link href={`/lectures/${l.lectureId}`} className="hover:underline">
                      {l.title}
                    </Link>
                  </Td>
                  <Td num>{l.watchHours.toFixed(1)}</Td>
                  <Td num className="text-muted-foreground">
                    {l.views}
                  </Td>
                </tr>
              ))}
            </DataTable>
          )}
        </section>

        <section>
          <SectionTitle title={t("analytics.teacherWorkloadTitle")} />
          {teacherWorkload.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("analytics.noData")}</p>
          ) : (
            <DataTable head={[t("analytics.colTeacher"), t("analytics.colDoubtTaken"), t("analytics.colCopiesChecked")]}>
              {teacherWorkload.map((tw) => (
                <tr key={tw.teacherId}>
                  <Td className="font-medium">{tw.name}</Td>
                  <Td num>{tw.doubtClassesTaken}</Td>
                  <Td num>{tw.answerCopiesChecked}</Td>
                </tr>
              ))}
            </DataTable>
          )}
        </section>
      </div>
    </>
  );
}
