import { FileCheck2 } from "lucide-react";
import { requireRole } from "@/lib/require-role";
import {
  getTeacherAnswerCopyQueue,
  getTeacherCheckedCopies,
  getAdminAnswerCopyOverview,
} from "@/lib/queries/answer-copies";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TeacherQueueItem } from "@/components/answer-copies/teacher-queue-item";
import { ANSWER_COPY_STATUS_LABEL, ANSWER_COPY_STATUS_COLOR } from "@/lib/answer-copy-status";

export default async function AdminAnswerCopiesPage() {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);

  if (session.user.role === "TEACHER") {
    const [queue, checked] = await Promise.all([
      getTeacherAnswerCopyQueue(session.user.id),
      getTeacherCheckedCopies(session.user.id),
    ]);

    return (
      <div>
        <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">उत्तरपुस्तिका जाँच — मेरी सूची</h1>

        <h2 className="mb-3 font-sans text-lg font-semibold text-foreground">लंबित</h2>
        {queue.length === 0 ? (
          <EmptyState icon={FileCheck2} title="अभी कोई लंबित उत्तरपुस्तिका नहीं है" />
        ) : (
          <div className="space-y-3">
            {queue.map((c) => (
              <TeacherQueueItem key={c.id} copy={c} />
            ))}
          </div>
        )}

        <h2 className="mb-3 mt-8 font-sans text-lg font-semibold text-foreground">हाल की जाँची गई</h2>
        {checked.length === 0 ? (
          <p className="text-sm text-muted-foreground">अभी कोई जाँची गई उत्तरपुस्तिका नहीं है।</p>
        ) : (
          <div className="space-y-2">
            {checked.map((c) => (
              <Card key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <div className="text-sm">
                  <p className="font-medium text-foreground">{c.paperName}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.student.name} · {c.subject.nameHi}
                  </p>
                </div>
                <span className="text-sm font-semibold text-success">
                  {c.marksAwarded} / {c.totalMarks}
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  const { pending, recent, turnaroundHours } = await getAdminAnswerCopyOverview();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">उत्तरपुस्तिका जाँच — अवलोकन</h1>
        <p className="text-sm text-muted-foreground">
          औसत निपटान समय: {turnaroundHours !== null ? `${turnaroundHours.toFixed(1)} घंटे` : "—"}
        </p>
      </div>

      <h2 className="mb-3 font-sans text-lg font-semibold text-foreground">शिक्षकवार लंबित</h2>
      {pending.length === 0 ? (
        <p className="mb-8 text-sm text-muted-foreground">कोई लंबित उत्तरपुस्तिका नहीं है।</p>
      ) : (
        <div className="mb-8 grid gap-2.5 sm:grid-cols-2">
          {pending.map((p) => (
            <Card key={p.teacherId} className="flex items-center justify-between p-3 text-sm">
              <span className="font-medium text-foreground">{p.teacherName}</span>
              <span className="font-semibold text-[var(--color-section-answercopies)]">{p.count} लंबित</span>
            </Card>
          ))}
        </div>
      )}

      <h2 className="mb-3 font-sans text-lg font-semibold text-foreground">हाल की गतिविधि</h2>
      {recent.length === 0 ? (
        <EmptyState icon={FileCheck2} title="अभी कोई उत्तरपुस्तिका जमा नहीं हुई है" />
      ) : (
        <div className="space-y-2">
          {recent.map((c) => (
            <Card key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
              <div className="text-sm">
                <p className="font-medium text-foreground">{c.paperName}</p>
                <p className="text-xs text-muted-foreground">
                  {c.student.name} → {c.teacher.name} · {c.subject.nameHi}
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
