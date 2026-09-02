import { Download, Crown } from "lucide-react";
import { getLeaderboard } from "@/lib/queries/leaderboard";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { LeaderboardPeriod } from "@prisma/client";

const PERIOD_LABEL: Record<LeaderboardPeriod, string> = { WEEKLY: "साप्ताहिक", MONTHLY: "मासिक", ALL_TIME: "सर्वकालिक" };

export default async function AdminLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const period = (sp.period as LeaderboardPeriod) || "ALL_TIME";
  const entries = await getLeaderboard({ period });
  const top = entries.slice(0, 100);

  const exportQs = new URLSearchParams({ period }).toString();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground">शीर्ष प्रदर्शन</h1>
          <p className="text-sm text-muted-foreground">जिले भर के {entries.length} सक्रिय विद्यार्थी</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={`/api/admin/leaderboard/export?${exportQs}`}>
            <Download className="h-4 w-4" /> CSV निर्यात करें
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
          लागू करें
        </Button>
      </form>

      {top.length === 0 ? (
        <EmptyState icon={Crown} title="अभी कोई डेटा उपलब्ध नहीं है" />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">रैंक</th>
                <th className="p-3">नाम</th>
                <th className="p-3">विद्यालय</th>
                <th className="p-3">कक्षा</th>
                <th className="p-3">अंक</th>
                <th className="p-3">सटीकता</th>
                <th className="p-3">प्रयास</th>
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
