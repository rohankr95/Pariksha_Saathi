import { Card } from "@/components/ui/card";
import { ANSWER_COPY_STATUS_LABEL, ANSWER_COPY_STATUS_COLOR } from "@/lib/answer-copy-status";
import type { AnswerCopyStatus } from "@prisma/client";

type Copy = {
  id: string;
  paperName: string;
  status: AnswerCopyStatus;
  marksAwarded: number | null;
  totalMarks: number | null;
  remarks: string | null;
  checkedFileUrl: string | null;
  submittedAt: Date;
  teacher: { name: string };
  subject: { nameHi: string };
};

export function MyCopiesList({ copies }: { copies: Copy[] }) {
  return (
    <div className="space-y-3">
      {copies.map((c) => (
        <Card key={c.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">{c.paperName}</p>
              <p className="text-xs text-muted-foreground">
                {c.subject.nameHi} · {c.teacher.name} ·{" "}
                {new Intl.DateTimeFormat("hi-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(c.submittedAt)}
              </p>
            </div>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: `color-mix(in srgb, var(${ANSWER_COPY_STATUS_COLOR[c.status]}) 15%, transparent)`,
                color: `var(${ANSWER_COPY_STATUS_COLOR[c.status]})`,
              }}
            >
              {ANSWER_COPY_STATUS_LABEL[c.status]}
            </span>
          </div>

          {c.status === "CHECKED" || c.status === "RETURNED" ? (
            <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
              <p className="font-semibold text-foreground">
                अंक: {c.marksAwarded} / {c.totalMarks}
              </p>
              {c.remarks && <p className="text-xs text-muted-foreground">{c.remarks}</p>}
              {c.checkedFileUrl && (
                <a href={c.checkedFileUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary hover:underline">
                  जाँची गई फाइल देखें
                </a>
              )}
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
