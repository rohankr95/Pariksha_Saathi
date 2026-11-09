import Link from "next/link";
import { requireRole } from "@/lib/require-role";
import { getT, getServerLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";
import { TABS, parseReportParams } from "./_tabs/params";
import { OverviewTab } from "./_tabs/overview-tab";
import { StudentsTab } from "./_tabs/students-tab";
import { ActivityTab } from "./_tabs/activity-tab";
import { VideosTab } from "./_tabs/videos-tab";
import { UploadsTab } from "./_tabs/uploads-tab";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireRole(["SUPER_ADMIN"]);
  const t = await getT();
  const locale = await getServerLocale();
  const params = parseReportParams(await searchParams);

  return (
    <div>
      <h1 className="font-sans text-2xl font-bold text-foreground">{t("analytics.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("analytics.subtitle")}</p>

      <nav aria-label={t("analytics.title")} className="-mx-1 mt-5 mb-6 overflow-x-auto border-b border-border">
        <ul className="flex min-w-max gap-1 px-1">
          {TABS.map((tab) => {
            const active = params.tab === tab;
            return (
              <li key={tab}>
                <Link
                  href={tab === "overview" ? "/admin/analytics" : `/admin/analytics?tab=${tab}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "-mb-px inline-block border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t(`analytics.tabs.${tab}`)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {params.tab === "overview" && <OverviewTab t={t} params={params} />}
      {params.tab === "students" && <StudentsTab t={t} locale={locale} />}
      {params.tab === "activity" && <ActivityTab t={t} params={params} locale={locale} />}
      {params.tab === "videos" && <VideosTab t={t} params={params} locale={locale} />}
      {params.tab === "uploads" && <UploadsTab t={t} params={params} />}
    </div>
  );
}
