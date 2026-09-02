"use client";

import { useTransition } from "react";
import { ThumbsUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { upvoteClassRequest } from "@/app/class-request/actions";
import { useLocale } from "@/lib/i18n/locale-provider";

type FeedItem = {
  id: string;
  chapter: string | null;
  upvotes: number;
  upvoterIds: string[];
  subject: { nameHi: string };
  preferredTeacher: { name: string } | null;
};

export function RequestFeed({ requests, myId }: { requests: FeedItem[]; myId: string }) {
  const [pending, startTransition] = useTransition();
  const { t } = useLocale();

  return (
    <div>
      <h2 className="mb-3 font-sans text-base font-semibold text-foreground">{t("classRequest.feed.heading")}</h2>
      <p className="mb-3 text-xs text-muted-foreground">{t("classRequest.feed.hint")}</p>
      <div className="space-y-2">
        {requests.map((r) => {
          const voted = r.upvoterIds.includes(myId);
          return (
            <Card key={r.id} className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {r.subject.nameHi}
                  {r.chapter ? ` · ${r.chapter}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.preferredTeacher ? r.preferredTeacher.name : t("classRequest.anyTeacherLabel")}
                </p>
              </div>
              <button
                disabled={voted || pending}
                onClick={() => startTransition(() => upvoteClassRequest(r.id))}
                className={
                  "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (voted ? "bg-success/15 text-success" : "border border-border text-muted-foreground hover:bg-surface-muted")
                }
              >
                <ThumbsUp className="h-3.5 w-3.5" /> {r.upvotes}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
