import Link from "next/link";
import { Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";

type Entry = {
  rank: number;
  studentId: string;
  name: string;
  school: string;
  points: number;
  accuracy: number;
};

const RANK_COLORS = ["text-[#d99a1b]", "text-[#8a8f9c]", "text-[#b1712c]"];

export async function LeaderboardPreview({ entries, title, viewAllLabel }: { entries: Entry[]; title: string; viewAllLabel: string }) {
  const t = await getT();
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-sans text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
        <Link href="/leaderboard" className="text-sm font-medium text-primary hover:underline">
          {viewAllLabel}
        </Link>
      </div>
      {entries.length > 0 ? (
        <Card className="divide-y divide-border p-0">
          {entries.map((entry) => (
            <div key={entry.studentId} className="flex items-center gap-3 px-4 py-3">
              <Crown
                className={cn("h-5 w-5 shrink-0", RANK_COLORS[entry.rank - 1] ?? "text-muted-foreground")}
                aria-hidden="true"
              />
              <span className="w-5 shrink-0 text-sm font-bold text-muted-foreground">
                #{entry.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{entry.name}</p>
                {entry.school && (
                  <p className="truncate text-xs text-muted-foreground">{entry.school}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-primary">{entry.points}</p>
                <p className="text-[11px] text-muted-foreground">{entry.accuracy}%</p>
              </div>
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState
          icon={Crown}
          title={t("leaderboard.public.empty")}
          description={t("leaderboard.public.emptyDesc")}
        />
      )}
    </div>
  );
}
