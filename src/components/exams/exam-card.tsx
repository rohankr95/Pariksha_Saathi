import { ExternalLink, FileText, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubscribeButton } from "@/components/exams/subscribe-button";
import { computeExamStatus, daysUntil, formatIST } from "@/lib/exam-status";
import { cn } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";

type ExamCardData = {
  id: string;
  name: string;
  body: string;
  category: string;
  applyStart: Date | null;
  applyEnd: Date | null;
  examDate: Date | null;
  resultDate: Date | null;
  officialUrl: string | null;
  notificationUrl: string | null;
};

const STATUS_COLOR: Record<string, string> = {
  UPCOMING: "--color-section-career",
  ONGOING: "--color-section-examdates",
  CLOSED: "--muted-foreground",
};

export async function ExamCard({
  exam,
  isStudent,
  subscribed,
}: {
  exam: ExamCardData;
  isStudent: boolean;
  subscribed: boolean;
}) {
  const t = await getT();
  const status = computeExamStatus(exam);
  const remaining = daysUntil(exam.applyEnd);
  const urgent = remaining !== null && remaining >= 0 && remaining <= 7;

  return (
    <Card className={cn("p-4", urgent && "border-[var(--color-section-examdates)]/40")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <Badge variant="outline" className="mb-1.5 text-[10px]">
            {exam.category}
          </Badge>
          <p className="text-sm font-semibold text-foreground">{exam.name}</p>
          <p className="text-xs text-muted-foreground">{exam.body}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
          style={{
            backgroundColor: `color-mix(in srgb, var(${STATUS_COLOR[status]}) 15%, transparent)`,
            color: `var(${STATUS_COLOR[status]})`,
          }}
        >
          {t(`examDates.status.${status}`)}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        <div>
          <dt className="inline">{t("examDates.card.apply")}</dt>
          <dd className="inline text-foreground">
            {formatIST(exam.applyStart)} – {formatIST(exam.applyEnd)}
          </dd>
        </div>
        <div>
          <dt className="inline">{t("examDates.card.exam")}</dt>
          <dd className="inline text-foreground">{formatIST(exam.examDate)}</dd>
        </div>
      </dl>

      {urgent && (
        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-[var(--color-section-examdates)]">
          <CalendarClock className="h-3.5 w-3.5" />
          {t("examDates.card.urgent", { count: remaining! })}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {exam.officialUrl && (
          <a
            href={exam.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" /> {t("examDates.card.officialSite")}
          </a>
        )}
        {exam.notificationUrl && (
          <a
            href={exam.notificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <FileText className="h-3.5 w-3.5" /> {t("examDates.card.notification")}
          </a>
        )}
        {isStudent && (
          <span className="ml-auto">
            <SubscribeButton examId={exam.id} initialSubscribed={subscribed} />
          </span>
        )}
      </div>
    </Card>
  );
}

export type { ExamCardData };
