import Link from "next/link";
import type { ClassLevel } from "@prisma/client";
import { Eye, Users, PlayCircle, CheckCircle2, Download, Clapperboard } from "lucide-react";
import { StatTile, StatGroup } from "@/components/admin/analytics/stat-tile";
import { TrendBarChart } from "@/components/admin/analytics/trend-bar-chart";
import { LectureThumbnail } from "@/components/lectures/thumbnail";
import { AdminPagination } from "@/components/admin/pagination";
import { youtubeThumbnail } from "@/lib/youtube";
import { getActivityBreakdown, getSubjectWatch, getVideoTotals, getVideoTraffic, VIDEO_SORTS } from "@/lib/queries/analytics-reports";
import { DataTable, SectionTitle, SegmentLinks, Td } from "./controls";
import { PeriodControls } from "./activity-tab";
import { reportHref, type ReportParams } from "./params";

type T = (key: string, vars?: Record<string, string | number>) => string;

const CLASS_LEVELS: ClassLevel[] = ["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"];

function formatDate(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function formatDuration(sec: number | null) {
  if (!sec) return null;
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

export async function VideosTab({ t, params, locale }: { t: T; params: ReportParams; locale: "hi" | "en" }) {
  const weekly = params.g === "week";
  const [totals, trend, subjects, traffic] = await Promise.all([
    getVideoTotals(),
    getActivityBreakdown(params.g, params.n),
    getSubjectWatch(),
    getVideoTraffic({ sort: params.sort, page: params.page, classLevel: params.cls }),
  ]);

  const pageParams: Record<string, string | undefined> = {
    tab: "videos",
    g: params.g,
    n: String(params.n),
    sort: params.sort,
    cls: params.cls,
  };

  return (
    <>
      <StatGroup title={t("analytics.groupVideoTraffic")}>
        <StatTile label={t("analytics.publishedLectures")} value={totals.publishedLectures} icon={Clapperboard} color="--color-section-lectures" />
        <StatTile label={t("analytics.lectureViews")} value={totals.views} sublabel={t("analytics.lectureViewsSub")} icon={Eye} color="--color-section-lectures" />
        <StatTile label={t("analytics.uniqueViewers")} value={totals.uniqueViewers} sublabel={t("analytics.uniqueViewersSub")} icon={Users} color="--success" />
        <StatTile label={t("analytics.watchHours")} value={totals.watchHours.toFixed(1)} sublabel={t("analytics.watchHoursSublabel")} icon={PlayCircle} color="--color-section-lectures" />
        <StatTile
          label={t("analytics.completionRate")}
          value={totals.completionRate === null ? "—" : `${Math.round(totals.completionRate)}%`}
          sublabel={t("analytics.completionSub")}
          icon={CheckCircle2}
          color="--success"
        />
        <StatTile label={t("analytics.noteDownloads")} value={totals.noteDownloads} icon={Download} color="--color-section-notes" />
      </StatGroup>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <PeriodControls t={t} params={params} />
        </div>
        <TrendBarChart
          data={trend.map((r) => ({ date: r.date, count: r.viewers }))}
          color="var(--color-section-lectures)"
          caption={`${weekly ? t("analytics.chartViewersWeekly") : t("analytics.chartViewersDaily")} — ${t("analytics.viewerTrendNote")}`}
          valueLabel={t("analytics.viewersLabel")}
          weekly={weekly}
          wide
        />
      </section>

      <section className="mt-8">
        <SectionTitle title={t("analytics.subjectTitle")} />
        {subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("analytics.noData")}</p>
        ) : (
          <DataTable
            head={[
              t("analytics.colSubject"),
              t("analytics.colLectures"),
              t("analytics.colViews"),
              t("analytics.colViewers"),
              t("analytics.colWatchHours"),
            ]}
          >
            {subjects.map((s) => (
              <tr key={s.subjectHi + s.subjectEn}>
                <Td className="font-medium">{locale === "en" ? s.subjectEn : s.subjectHi}</Td>
                <Td num>{s.lectures}</Td>
                <Td num>{s.views}</Td>
                <Td num>{s.viewers}</Td>
                <Td num>{s.watchHours.toFixed(1)}</Td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>

      <section className="mt-8">
        <SectionTitle title={t("analytics.videoTableTitle")} />
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SegmentLinks
            label={t("analytics.sortBy")}
            options={VIDEO_SORTS.map((sort) => ({
              label: t(`analytics.sort.${sort}`),
              href: reportHref(params, { sort, page: undefined }),
              active: params.sort === sort,
            }))}
          />
          <SegmentLinks
            label={t("analytics.colClass")}
            options={[undefined, ...CLASS_LEVELS].map((cls) => ({
              label: cls ? t(`analytics.classLabel.${cls}`) : t("analytics.allClasses"),
              href: reportHref(params, { cls, page: undefined }),
              active: params.cls === cls,
            }))}
          />
        </div>

        {traffic.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("analytics.noData")}</p>
        ) : (
          <DataTable
            head={[
              t("analytics.colVideo"),
              t("analytics.colViews"),
              t("analytics.colViewers"),
              t("analytics.colWatchHours"),
              t("analytics.colCompleted"),
              t("analytics.colUploaded"),
            ]}
          >
            {traffic.items.map((v) => {
              const duration = formatDuration(v.durationSec);
              return (
                <tr key={v.id}>
                  <Td>
                    <div className="flex min-w-[260px] items-center gap-3">
                      <Link
                        href={`/lectures/${v.id}`}
                        className="relative block aspect-video w-28 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-surface-muted"
                      >
                        <LectureThumbnail src={v.thumbnailUrl ?? youtubeThumbnail(v.youtubeUrl)} sizes="112px" />
                        {duration && (
                          <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[10px] font-medium text-white">
                            {duration}
                          </span>
                        )}
                      </Link>
                      <div className="min-w-0">
                        <Link href={`/lectures/${v.id}`} className="line-clamp-2 font-medium hover:underline">
                          {v.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {locale === "en" ? v.subjectEn : v.subjectHi} · {t(`analytics.classLabel.${v.classLevel}`)} · {v.teacher}
                          {!v.isPublished && (
                            <span className="ml-1.5 rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px]">{t("analytics.draft")}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td num className="font-semibold">{v.views}</Td>
                  <Td num>{v.viewers}</Td>
                  <Td num>{v.watchHours.toFixed(1)}</Td>
                  <Td num>
                    {v.completions}
                    {v.viewers > 0 && (
                      <span className="ml-1 text-xs text-muted-foreground">({Math.round((v.completions / v.viewers) * 100)}%)</span>
                    )}
                  </Td>
                  <Td num className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(v.createdAt)}</Td>
                </tr>
              );
            })}
          </DataTable>
        )}
        <AdminPagination page={params.page} totalPages={traffic.totalPages} basePath="/admin/analytics" searchParams={pageParams} />
      </section>
    </>
  );
}
