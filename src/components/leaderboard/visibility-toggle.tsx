"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { setLeaderboardVisibility } from "@/app/leaderboard/actions";
import { useLocale } from "@/lib/i18n/locale-provider";

export function LeaderboardVisibilityToggle({ currentlyVisible }: { currentlyVisible: boolean }) {
  const { t } = useLocale();
  const [visible, setVisible] = useState(currentlyVisible);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-6 flex items-center justify-between rounded-[var(--radius-md)] border border-border p-3.5 text-sm">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        {visible ? t("leaderboard.public.visibleMessage") : t("leaderboard.public.hiddenMessage")}
      </span>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const next = !visible;
            setVisible(next);
            await setLeaderboardVisibility(next);
          })
        }
        className="shrink-0 text-xs font-semibold text-primary hover:underline"
      >
        {visible ? t("leaderboard.public.hideMe") : t("leaderboard.public.showMe")}
      </button>
    </div>
  );
}
