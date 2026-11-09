import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { GroupedBarChart } from "@/components/admin/analytics/grouped-bar-chart";
import { blockLabel } from "@/lib/blocks";
import { getBlockClassReport, getClassSummary, getTopSchools } from "@/lib/queries/analytics-reports";
import { DataTable, SectionTitle, Td } from "./controls";

type T = (key: string, vars?: Record<string, string | number>) => string;

function pct(part: number, whole: number) {
  return whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";
}

export async function StudentsTab({ t, locale }: { t: T; locale: "hi" | "en" }) {
  const [{ rows, totals }, classSummary, schools] = await Promise.all([
    getBlockClassReport(),
    getClassSummary(),
    getTopSchools(10),
  ]);

  const nameOf = (block: string | null) => (block ? blockLabel(block, locale) : t("analytics.otherBlock"));
  const other = rows.find((r) => r.block === null);

  return (
    <>
      <section>
        <SectionTitle title={t("analytics.blockClassTitle")} note={t("analytics.blockClassNote")} />
        <GroupedBarChart
          caption={t("analytics.blockClassChart")}
          series={[
            { key: "CLASS_10", label: t("analytics.classLabel.CLASS_10"), color: "var(--series-1)" },
            { key: "CLASS_12", label: t("analytics.classLabel.CLASS_12"), color: "var(--series-2)" },
          ]}
          categories={rows.map((r) => ({ label: nameOf(r.block), values: r.byClass }))}
        />

        {other && (
          <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-section-leaderboard)]" aria-hidden="true" />
            <span>
              {t("analytics.otherBlockHint", { count: other.total })}{" "}
              <Link href="/admin/students" className="font-medium text-primary hover:underline">
                {t("admin.students.cleanup.title")} →
              </Link>
            </span>
          </p>
        )}

        <div className="mt-4">
          <DataTable
            head={[
              t("analytics.colBlock"),
              t("analytics.classLabel.CLASS_9"),
              t("analytics.classLabel.CLASS_10"),
              t("analytics.classLabel.CLASS_11"),
              t("analytics.classLabel.CLASS_12"),
              t("analytics.total"),
              t("analytics.colActive30d"),
              t("analytics.colActiveShare"),
              t("analytics.colNeverActive"),
            ]}
          >
            {rows.map((r) => (
              <tr key={r.block ?? "other"}>
                <Td className={r.block ? "whitespace-nowrap font-medium" : "whitespace-nowrap italic text-muted-foreground"}>{nameOf(r.block)}</Td>
                <Td num className="text-muted-foreground">{r.byClass.CLASS_9}</Td>
                <Td num className="font-semibold">{r.byClass.CLASS_10}</Td>
                <Td num className="text-muted-foreground">{r.byClass.CLASS_11}</Td>
                <Td num className="font-semibold">{r.byClass.CLASS_12}</Td>
                <Td num>{r.total}</Td>
                <Td num>{r.active30d}</Td>
                <Td num>{pct(r.active30d, r.total)}</Td>
                <Td num className="text-muted-foreground">{r.neverActive}</Td>
              </tr>
            ))}
            <tr className="bg-surface-muted font-semibold">
              <Td>{t("analytics.total")}</Td>
              <Td num>{totals.byClass.CLASS_9}</Td>
              <Td num>{totals.byClass.CLASS_10}</Td>
              <Td num>{totals.byClass.CLASS_11}</Td>
              <Td num>{totals.byClass.CLASS_12}</Td>
              <Td num>{totals.total}</Td>
              <Td num>{totals.active30d}</Td>
              <Td num>{pct(totals.active30d, totals.total)}</Td>
              <Td num>{totals.neverActive}</Td>
            </tr>
          </DataTable>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <SectionTitle title={t("analytics.classSummaryTitle")} />
          <DataTable
            head={[
              t("analytics.colClass"),
              t("analytics.colStudents"),
              t("analytics.colActive30d"),
              t("analytics.colQuizAttempts"),
              t("analytics.colAvgAccuracy"),
              t("analytics.colWatchHours"),
            ]}
          >
            {classSummary.map((c) => (
              <tr key={c.classLevel}>
                <Td className="whitespace-nowrap font-medium">{t(`analytics.classLabel.${c.classLevel}`)}</Td>
                <Td num>{c.students}</Td>
                <Td num>{c.active30d}</Td>
                <Td num>{c.quizAttempts}</Td>
                <Td num>{c.avgAccuracy === null ? "—" : `${Math.round(c.avgAccuracy)}%`}</Td>
                <Td num>{c.watchHours.toFixed(1)}</Td>
              </tr>
            ))}
          </DataTable>
        </section>

        <section>
          <SectionTitle title={t("analytics.topSchoolsTitle")} />
          {schools.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("analytics.noData")}</p>
          ) : (
            <DataTable head={[t("analytics.colSchool"), t("analytics.colStudents"), t("analytics.colActive30d")]}>
              {schools.map((s) => (
                <tr key={s.school}>
                  <Td className="max-w-[260px] truncate font-medium">
                    <span title={s.school}>{s.school}</span>
                  </Td>
                  <Td num>{s.students}</Td>
                  <Td num>{s.active30d}</Td>
                </tr>
              ))}
            </DataTable>
          )}
        </section>
      </div>
    </>
  );
}
