import { Download, Crown } from "lucide-react";
import { getLeaderboard } from "@/lib/queries/leaderboard";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getT } from "@/lib/i18n/server";
import type { LeaderboardPeriod } from "@prisma/client";

export default async function AdminLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const period = (sp.period as LeaderboardPeriod) || "ALL_TIME";
  const t = await getT();
  const PERIOD_LABEL: Record<LeaderboardPeriod, string> = {
    WEEKLY: t("leaderboard.period.WEEKLY"),
    MONTHLY: t("leaderboard.period.MONTHLY"),
    ALL_TIME: t("leaderboard.period.ALL_TIME"),
  };
  const entries = await getLeaderboard({ period });
  const top = entries.slice(0, 100);

  const exportQs = new URLSearchParams({ period }).toString();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground">{t("leaderboard.admin.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("leaderboard.admin.activeStudents", { count: entries.length })}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={`/api/admin/leaderboard/export?${exportQs}`}>
            <Download className="h-4 w-4" /> {t("leaderboard.admin.exportCsv")}
          </a>
        </Button>
      </div>

      <form action="/admin/leaderboard" className="mb-4 flex gap-2.5">
        <Select name="period" defaultValue={period} className="max-w-[180px]">
          {(Object.keys(PERIOD_LABEL) as LeaderboardPeriod[]).map((p) => (
            <option key={p} value={p}>
              {PERIOD_LABEL[p]}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm" variant="outline">
          {t("leaderboard.admin.apply")}
        </Button>
      </form>

      {top.length === 0 ? (
        <EmptyState icon={Crown} title={t("leaderboard.admin.empty")} />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">{t("leaderboard.admin.colRank")}</th>
                <th className="p-3">{t("leaderboard.admin.colName")}</th>
                <th className="p-3">{t("leaderboard.admin.colSchool")}</th>
                <th className="p-3">{t("leaderboard.admin.colClass")}</th>
                <th className="p-3">{t("leaderboard.admin.colPoints")}</th>
                <th className="p-3">{t("leaderboard.admin.colAccuracy")}</th>
                <th className="p-3">{t("leaderboard.admin.colAttempts")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {top.map((e) => (
                <tr key={e.studentId}>
                  <td className="p-3 font-semibold">#{e.rank}</td>
                  <td className="p-3">{e.displayName}</td>
                  <td className="p-3 text-muted-foreground">{e.school}</td>
                  <td className="p-3 text-muted-foreground">{e.classLevel ? CLASS_LEVEL_LABEL[e.classLevel] : "—"}</td>
                  <td className="p-3 font-semibold text-primary">{e.points}</td>
                  <td className="p-3 text-muted-foreground">{e.accuracy}%</td>
                  <td className="p-3 text-muted-foreground">{e.quizzesAttempted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
