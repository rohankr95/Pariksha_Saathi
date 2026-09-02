import { Sparkles, Award, Trophy, Flame, Star, Target, type LucideIcon } from "lucide-react";
import { ALL_BADGES, type BadgeId } from "@/lib/gamification";
import { getT } from "@/lib/i18n/server";

const BADGE_ICON: Record<BadgeId, LucideIcon> = {
  FIRST_QUIZ: Sparkles,
  QUIZ_10: Award,
  QUIZ_25: Trophy,
  STREAK_3: Flame,
  STREAK_7: Flame,
  STREAK_30: Flame,
  XP_100: Star,
  XP_500: Star,
  XP_1000: Star,
  PERFECT_SCORE: Target,
};

export async function BadgeList({ earned }: { earned: string[] }) {
  const t = await getT();
  const earnedSet = new Set(earned);

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
      {ALL_BADGES.map((id) => {
        const Icon = BADGE_ICON[id];
        const isEarned = earnedSet.has(id);
        return (
          <div
            key={id}
            className={
              "flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] border p-3 text-center " +
              (isEarned ? "border-[var(--color-section-quiz)]/40 bg-[var(--color-section-quiz)]/10" : "border-border opacity-40 grayscale")
            }
            title={t(`dashboard.badges.${id}`)}
          >
            <span
              className={
                "flex h-9 w-9 items-center justify-center rounded-full " +
                (isEarned ? "bg-[var(--color-section-quiz)]/20 text-[var(--color-section-quiz)]" : "bg-surface-muted text-muted-foreground")
              }
            >
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <span className="text-[11px] font-medium leading-tight text-foreground">{t(`dashboard.badges.${id}`)}</span>
          </div>
        );
      })}
    </div>
  );
}
