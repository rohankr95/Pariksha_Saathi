import { Crown, Info } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLeaderboard, getFilterOptions } from "@/lib/queries/leaderboard";
import { getSubjects, CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { getBadges } from "@/lib/leaderboard-badges";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LeaderboardVisibilityToggle } from "@/components/leaderboard/visibility-toggle";
import type { ClassLevel, LeaderboardPeriod } from "@prisma/client";

export const metadata = { title: "शीर्ष प्रदर्शन | परीक्षा साथी" };

const TOP_N = 50;
const PERIOD_LABEL: Record<LeaderboardPeriod, string> = { WEEKLY: "साप्ताहिक", MONTHLY: "मासिक", ALL_TIME: "सर्वकालिक" };

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const period = (sp.period as LeaderboardPeriod) || "ALL_TIME";
  const filters = {
    period,
    subjectId: sp.subjectId,
    classLevel: sp.classLevel as ClassLevel | undefined,
    school: sp.school,
    block: sp.block,
  };

  const [entries, subjects, { schools, blocks }, session] = await Promise.all([
    getLeaderboard(filters),
    getSubjects(),
    getFilterOptions(),
    auth(),
  ]);

  const top = entries.slice(0, TOP_N);
  const myId = session?.user?.role === "STUDENT" ? session.user.id : null;
  const myEntry = myId ? entries.find((e) => e.studentId === myId) : null;
  const myInTop = myEntry ? myEntry.rank <= TOP_N : false;
  const myVisibility = myId
    ? await prisma.user.findUnique({ where: { id: myId }, select: { onLeaderboard: true } })
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-leaderboard)]/15 text-[var(--color-section-leaderboard)]">
          <Crown className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground sm:text-3xl">शीर्ष प्रदर्शन</h1>
          <p className="text-sm text-muted-foreground">जिले के सर्वश्रेष्ठ विद्यार्थी</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(Object.keys(PERIOD_LABEL) as LeaderboardPeriod[]).map((p) => (
          <a
            key={p}
            href={`/leaderboard?${new URLSearchParams({ ...sp, period: p }).toString()}`}
            className={
              "rounded-full px-3 py-1.5 text-xs font-semibold " +
              (period === p ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground")
            }
          >
            {PERIOD_LABEL[p]}
          </a>
        ))}
      </div>

      <form action="/leaderboard" className="mb-6 flex flex-wrap gap-2.5">
        <input type="hidden" name="period" value={period} />
        <Select name="subjectId" defaultValue={filters.subjectId ?? ""} className="max-w-[180px]">
          <option value="">सभी विषय</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nameHi}
            </option>
          ))}
        </Select>
        <Select name="classLevel" defaultValue={filters.classLevel ?? ""} className="max-w-[150px]">
          <option value="">सभी कक्षाएँ</option>
          {(Object.keys(CLASS_LEVEL_LABEL) as ClassLevel[]).map((c) => (
            <option key={c} value={c}>
              {CLASS_LEVEL_LABEL[c]}
            </option>
          ))}
        </Select>
        <Select name="block" defaultValue={filters.block ?? ""} className="max-w-[160px]">
          <option value="">सभी विकासखंड</option>
          {blocks.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
        <Select name="school" defaultValue={filters.school ?? ""} className="max-w-[220px]">
          <option value="">सभी विद्यालय</option>
          {schools.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm" variant="outline">
          फ़िल्टर लागू करें
        </Button>
      </form>

      {top.length > 0 ? (
        <Card className="divide-y divide-border p-0">
          {top.map((entry) => (
            <LeaderboardRow key={entry.studentId} entry={entry} highlight={entry.studentId === myId} isWeekly={period === "WEEKLY"} />
          ))}
          {myEntry && !myInTop && (
            <>
              <div className="bg-surface-muted px-4 py-1.5 text-center text-[11px] text-muted-foreground">⋯</div>
              <LeaderboardRow entry={myEntry} highlight isWeekly={period === "WEEKLY"} />
            </>
          )}
        </Card>
      ) : (
        <EmptyState icon={Crown} title="अभी कोई रैंकिंग उपलब्ध नहीं है" description="प्रश्नोत्तरी में भाग लें और सूची में सबसे ऊपर आएँ!" />
      )}

      <p className="mt-4 flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        रैंकिंग कुल अंकों पर आधारित है; बराबरी होने पर सटीकता, फिर औसत समय के आधार पर क्रम तय होता है। पूरा नाम व मोबाइल नंबर कभी सार्वजनिक नहीं किए जाते।
      </p>

      {session?.user?.role === "STUDENT" && (
        <LeaderboardVisibilityToggle currentlyVisible={myVisibility?.onLeaderboard ?? true} />
      )}
    </div>
  );
}

function LeaderboardRow({
  entry,
  highlight,
  isWeekly,
}: {
  entry: { rank: number; displayName: string; school: string; classLevel: string | null; points: number; accuracy: number; quizzesAttempted: number };
  highlight: boolean;
  isWeekly: boolean;
}) {
  const badges = getBadges(entry, entry.rank, isWeekly);
  const rankColor = entry.rank === 1 ? "text-[#d99a1b]" : entry.rank === 2 ? "text-[#8a8f9c]" : entry.rank === 3 ? "text-[#b1712c]" : "text-muted-foreground";

  return (
    <div className={"flex items-center gap-3 px-4 py-3 " + (highlight ? "bg-primary/5" : "")}>
      <span className={`w-8 shrink-0 text-center text-sm font-bold ${rankColor}`}>#{entry.rank}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {entry.displayName} {badges.map((b) => <span key={b.label} title={b.label}>{b.icon}</span>)}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {entry.school}
          {entry.classLevel ? ` · ${CLASS_LEVEL_LABEL[entry.classLevel as ClassLevel]}` : ""}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-primary">{entry.points}</p>
        <p className="text-[11px] text-muted-foreground">{entry.quizzesAttempted} प्रयास · {entry.accuracy}%</p>
      </div>
    </div>
  );
}
