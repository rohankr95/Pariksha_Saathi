"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, PlusCircle } from "lucide-react";
import { registerOlympiadInterest, withdrawOlympiadInterest } from "@/app/olympiad/actions";
import { useLocale } from "@/lib/i18n/locale-provider";

export function InterestButton({ olympiadId, initialInterested }: { olympiadId: string; initialInterested: boolean }) {
  const [interested, setInterested] = useState(initialInterested);
  const [pending, startTransition] = useTransition();
  const { t } = useLocale();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const next = !interested;
          setInterested(next);
          if (next) await registerOlympiadInterest(olympiadId);
          else await withdrawOlympiadInterest(olympiadId);
        })
      }
      className={
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold " +
        (interested
          ? "bg-success/15 text-success"
          : "bg-primary text-primary-foreground hover:brightness-110")
      }
    >
      {interested ? <CheckCircle2 className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
      {interested ? t("olympiad.interest.registered") : t("olympiad.interest.register")}
    </button>
  );
}
