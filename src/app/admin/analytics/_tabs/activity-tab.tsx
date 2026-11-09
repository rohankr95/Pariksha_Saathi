import { TrendLineChart } from "@/components/admin/analytics/trend-line-chart";
import { TrendBarChart } from "@/components/admin/analytics/trend-bar-chart";
import { formatPeriod } from "@/components/admin/analytics/format-date";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BLOCKS } from "@/lib/blocks";
import { getActivityBreakdown } from "@/lib/queries/analytics-reports";
import { DataTable, SectionTitle, SegmentLinks, Td } from "./controls";
import { RANGE_PRESETS, reportHref, type ReportParams } from "./params";

type T = (key: string, vars?: Record<string, string | number>) => string;

export function PeriodControls({ t, params }: { t: T; params: ReportParams }) {
  return (
    <>
      <SegmentLinks
        label={t("analytics.granularityLabel")}
        options={(["day", "week"] as const).map((g) => ({
          label: g === "day" ? t("analytics.daily") : t("analytics.weekly"),
          href: reportHref(params, { g, n: undefined, page: undefined }),
          active: params.g === g,
        }))}
      />
      <SegmentLinks
        label={t("analytics.rangeLabel")}
        options={RANGE_PRESETS[params.g].map((n) => ({
          label: params.g === "day" ? t("analytics.rangeDays", { n }) : t("analytics.rangeWeeks", { n }),
          href: reportHref(params, { n, page: undefined }),
          active: params.n === n,
        }))}
      />
    </>
  );
}

export async function ActivityTab({ t, params, locale }: { t: T; params: ReportParams; locale: "hi" | "en" }) {
  const weekly = params.g === "week";
  const rows = await getActivityBreakdown(params.g, params.n, params.block);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <PeriodControls t={t} params={params} />
        <form action="/admin/analytics" className="flex items-center gap-2">
          <input type="hidden" name="tab" value="activity" />
          <input type="hidden" name="g" value={params.g} />
          <input type="hidden" name="n" value={params.n} />
          <Select name="block" defaultValue={params.block ?? ""} className="h-9 w-auto min-w-[150px] text-sm" aria-label={t("analytics.colBlock")}>
            <option value="">{t("analytics.allBlocks")}</option>
            {BLOCKS.map((b) => (
              <option key={b.value} value={b.value}>
                {locale === "en" ? b.en : b.value}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="outline" size="sm">
            {t("analytics.apply")}
          </Button>
        </form>
      </div>

      <SectionTitle title={t("analytics.activityTitle")} note={t("analytics.activityNote")} />

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendLineChart
          data={rows.map((r) => ({ date: r.date, count: r.active }))}
          color="var(--success)"
          caption={weekly ? t("analytics.chartActiveWeekly") : t("analytics.chartActiveDaily")}
          valueLabel={t("analytics.activeStudentsLabel")}
          weekly={weekly}
        />
        <TrendBarChart
          data={rows.map((r) => ({ date: r.date, count: r.registrations }))}
          color="var(--color-section-lectures)"
          caption={weekly ? t("analytics.chartRegWeekly") : t("analytics.chartRegDaily")}
          valueLabel={t("analytics.registrationsLabel")}
          weekly={weekly}
        />
      </div>

      <div className="mt-6">
        <DataTable
          head={[
            weekly ? t("analytics.colWeek") : t("analytics.colDay"),
            t("analytics.colActive"),
            t("analytics.colViewers"),
            t("analytics.colQuizAttempts"),
            t("analytics.colRegistrations"),
          ]}
        >
          {[...rows].reverse().map((r) => (
            <tr key={r.date}>
              <Td className="whitespace-nowrap font-medium">{formatPeriod(r.date, weekly)}</Td>
              <Td num className="font-semibold">{r.active}</Td>
              <Td num>{r.viewers}</Td>
              <Td num>{r.quizAttempts}</Td>
              <Td num>{r.registrations}</Td>
            </tr>
          ))}
        </DataTable>
      </div>
    </>
  );
}
