import { FileText, FileCheck2, Search } from "lucide-react";
import type { AnswerCopyStatus } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminPagination } from "@/components/admin/pagination";
import { ANSWER_COPY_STATUS_COLOR } from "@/lib/answer-copy-status";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { getAdminAnswerCopies, getAnswerCopyTeachers } from "@/lib/queries/answer-copies";
import { getT, getServerLocale } from "@/lib/i18n/server";

const STATUSES: AnswerCopyStatus[] = ["SUBMITTED", "ASSIGNED", "UNDER_EVALUATION", "CHECKED", "RETURNED"];

function formatDate(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export async function AdminAnswerCopyList({ sp }: { sp: Record<string, string | undefined> }) {
  const t = await getT();
  const locale = await getServerLocale();
  const page = Math.max(1, Number(sp.page) || 1);
  const status =
    sp.status === "PENDING" || (STATUSES as string[]).includes(sp.status ?? "")
      ? (sp.status as AnswerCopyStatus | "PENDING")
      : undefined;

  const [teachers, { items, total, totalPages }] = await Promise.all([
    getAnswerCopyTeachers(),
    getAdminAnswerCopies({ status, teacherId: sp.teacher, q: sp.q, page }),
  ]);

  return (
    <section className="mt-10">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-sans text-lg font-semibold text-foreground">{t("answerCopies.admin.fullListHeading")}</h2>
          <p className="text-xs text-muted-foreground">{t("answerCopies.admin.fullListNote")}</p>
        </div>
        <p className="text-sm text-muted-foreground">{t("answerCopies.admin.total", { count: total })}</p>
      </div>

      <form className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input type="search" name="q" defaultValue={sp.q} placeholder={t("answerCopies.admin.search")} className="pl-9" />
        </div>
        <Select name="status" defaultValue={sp.status ?? ""} className="w-auto min-w-[150px]" aria-label={t("answerCopies.admin.colStatus")}>
          <option value="">{t("answerCopies.admin.allStatuses")}</option>
          <option value="PENDING">{t("answerCopies.admin.statusPending")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`answerCopies.status.${s}`)}
            </option>
          ))}
        </Select>
        <Select name="teacher" defaultValue={sp.teacher ?? ""} className="w-auto min-w-[150px]" aria-label={t("answerCopies.admin.colTeacher")}>
          <option value="">{t("answerCopies.admin.allTeachers")}</option>
          {teachers.map((tc) => (
            <option key={tc.id} value={tc.id}>
              {tc.name}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline">
          {t("answerCopies.admin.filter")}
        </Button>
      </form>

      {items.length === 0 ? (
        <EmptyState icon={FileCheck2} title={t("answerCopies.admin.empty")} />
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">{t("answerCopies.admin.colPaper")}</th>
                <th className="p-3 font-medium">{t("answerCopies.admin.colStudent")}</th>
                <th className="p-3 font-medium">{t("answerCopies.admin.colTeacher")}</th>
                <th className="p-3 font-medium">{t("answerCopies.admin.colSubject")}</th>
                <th className="p-3 font-medium">{t("answerCopies.admin.colStatus")}</th>
                <th className="whitespace-nowrap p-3 text-right font-medium">{t("answerCopies.admin.colMarks")}</th>
                <th className="whitespace-nowrap p-3 font-medium">{t("answerCopies.admin.colSubmitted")}</th>
                <th className="p-3 font-medium">{t("answerCopies.admin.colFiles")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((c) => (
                <tr key={c.id}>
                  <td className="max-w-[200px] p-3">
                    <p className="truncate font-medium text-foreground" title={c.paperName}>
                      {c.paperName}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.student.classLevel ? CLASS_LEVEL_LABEL[c.student.classLevel] : "—"}</p>
                  </td>
                  <td className="whitespace-nowrap p-3">{c.student.name}</td>
                  <td className="whitespace-nowrap p-3 font-medium">{c.teacher.name}</td>
                  <td className="whitespace-nowrap p-3 text-muted-foreground">{locale === "en" ? c.subject.nameEn : c.subject.nameHi}</td>
                  <td className="p-3">
                    <span
                      className="inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: `color-mix(in srgb, var(${ANSWER_COPY_STATUS_COLOR[c.status]}) 15%, transparent)`,
                        color: `var(${ANSWER_COPY_STATUS_COLOR[c.status]})`,
                      }}
                    >
                      {t(`answerCopies.status.${c.status}`)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap p-3 text-right tabular-nums">
                    {c.marksAwarded !== null && c.totalMarks !== null ? `${c.marksAwarded} / ${c.totalMarks}` : "—"}
                  </td>
                  <td className="whitespace-nowrap p-3 text-xs text-muted-foreground">{formatDate(c.submittedAt)}</td>
                  <td className="whitespace-nowrap p-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={c.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <FileText className="h-3.5 w-3.5" aria-hidden="true" /> {t("answerCopies.admin.original")}
                      </a>
                      {c.checkedFileUrl && (
                        <a
                          href={c.checkedFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-success hover:underline"
                        >
                          <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" /> {t("answerCopies.admin.checked")}
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/answer-copies" searchParams={sp} />
    </section>
  );
}
