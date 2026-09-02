"use client";

import { useState, useTransition } from "react";
import { Bell, BellRing } from "lucide-react";
import { subscribeToExam, unsubscribeFromExam } from "@/app/exam-dates/actions";
import { useLocale } from "@/lib/i18n/locale-provider";

export function SubscribeButton({ examId, initialSubscribed }: { examId: string; initialSubscribed: boolean }) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [pending, startTransition] = useTransition();
  const { t } = useLocale();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const next = !subscribed;
          setSubscribed(next);
          if (next) await subscribeToExam(examId);
          else await unsubscribeFromExam(examId);
        })
      }
      className={
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold " +
        (subscribed
          ? "bg-success/15 text-success"
          : "border border-border text-muted-foreground hover:bg-surface-muted")
      }
    >
      {subscribed ? <BellRing className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
      {subscribed ? t("examDates.subscribe.on") : t("examDates.subscribe.off")}
    </button>
  );
}
