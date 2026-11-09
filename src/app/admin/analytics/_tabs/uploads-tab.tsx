import { TrendBarChart } from "@/components/admin/analytics/trend-bar-chart";
import { formatPeriod } from "@/components/admin/analytics/format-date";
import { getContributors, getUploadActivity } from "@/lib/queries/analytics-reports";
import { DataTable, SectionTitle, Td } from "./controls";
import { PeriodControls } from "./activity-tab";
import type { ReportParams } from "./params";

type T = (key: string, vars?: Record<string, string | number>) => string;

function formatDate(d: Date | null) {
  if (!d) return "—";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export async function UploadsTab({ t, params }: { t: T; params: ReportParams }) {
  const weekly = params.g === "week";
  const [rows, contributors] = await Promise.all([getUploadActivity(params.g, params.n), getContributors()]);
  const sum = (k: "lectures" | "notes" | "quizzes") => rows.reduce((s, r) => s + r[k], 0);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <PeriodControls t={t} params={params} />
      </div>

      <SectionTitle title={t("analytics.uploadsTitle")} note={t("analytics.uploadsNote")} />
      <TrendBarChart
        data={rows.map((r) => ({ date: r.date, count: r.lectures }))}
        color="var(--color-section-lectures)"
        caption={weekly ? t("analytics.chartUploadsWeekly") : t("analytics.chartUploadsDaily")}
        valueLabel={t("analytics.uploadsLabel")}
        weekly={weekly}
        wide
      />

      <div className="mt-4">
        <DataTable
          head={[
            weekly ? t("analytics.colWeek") : t("analytics.colDay"),
            t("analytics.colLectures"),
            t("analytics.colNotes"),
            t("analytics.colQuizzes"),
          ]}
        >
          {[...rows].reverse().map((r) => (
            <tr key={r.date}>
              <Td className="whitespace-nowrap font-medium">{formatPeriod(r.date, weekly)}</Td>
              <Td num className="font-semibold">{r.lectures}</Td>
              <Td num>{r.notes}</Td>
              <Td num>{r.quizzes}</Td>
            </tr>
          ))}
          <tr className="bg-surface-muted font-semibold">
            <Td>{t("analytics.total")}</Td>
            <Td num>{sum("lectures")}</Td>
            <Td num>{sum("notes")}</Td>
            <Td num>{sum("quizzes")}</Td>
          </tr>
        </DataTable>
      </div>

      <section className="mt-8">
        <SectionTitle title={t("analytics.contributorsTitle")} />
        {contributors.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("analytics.noData")}</p>
        ) : (
          <DataTable
            head={[
              t("analytics.colTeacher"),
              t("analytics.colLectures"),
              t("analytics.colNotes"),
              t("analytics.colQuizzes"),
              t("analytics.colLectureViews"),
              t("analytics.colWatchHours"),
              t("analytics.colLastUpload"),
            ]}
          >
            {contributors.map((c) => (
              <tr key={c.userId}>
                <Td className="font-medium">
                  {c.name}
                  {c.role === "SUPER_ADMIN" && (
                    <span className="ml-1.5 rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {t("analytics.roleSuperAdmin")}
                    </span>
                  )}
                </Td>
                <Td num className="font-semibold">{c.lectures}</Td>
                <Td num>{c.notes}</Td>
                <Td num>{c.quizzes}</Td>
                <Td num>{c.lectureViews}</Td>
                <Td num>{c.lectureWatchHours.toFixed(1)}</Td>
                <Td num className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(c.lastUpload)}</Td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>
    </>
  );
}
