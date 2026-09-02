import Link from "next/link";
import { Pencil, Trash2, CalendarClock } from "lucide-react";
import { getAdminExams } from "@/lib/queries/admin-exams";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { computeExamStatus, formatIST } from "@/lib/exam-status";
import { getT } from "@/lib/i18n/server";
import { toggleExamPublish, deleteExam } from "./actions";

export default async function AdminExamDatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const t = await getT();
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, totalPages } = await getAdminExams({ q: sp.q, page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">{t("examDates.admin.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("examDates.admin.totalExams", { count: total })}</p>
      </div>

      <AdminListToolbar
        searchPlaceholder={t("examDates.admin.searchPlaceholder")}
        defaultSearch={sp.q}
        addHref="/admin/exam-dates/new"
        addLabel={t("examDates.admin.addLabel")}
      />

      {items.length === 0 ? (
        <EmptyState icon={CalendarClock} title={t("examDates.admin.empty")} description={t("examDates.admin.emptyDesc")} />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">{t("examDates.admin.colExam")}</th>
                <th className="p-3">{t("examDates.admin.colApplyEnd")}</th>
                <th className="p-3">{t("examDates.admin.colStatus")}</th>
                <th className="p-3">{t("examDates.admin.colPublish")}</th>
                <th className="p-3 text-right">{t("examDates.admin.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((exam) => (
                <tr key={exam.id}>
                  <td className="max-w-xs p-3 font-medium">
                    {exam.name}
                    <br />
                    <span className="text-xs text-muted-foreground">{exam.category}</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{formatIST(exam.applyEnd)}</td>
                  <td className="p-3 text-muted-foreground">{t(`examDates.status.${computeExamStatus(exam)}`)}</td>
                  <td className="p-3">
                    <PublishToggle
                      isPublished={exam.isPublished}
                      action={toggleExamPublish.bind(null, exam.id, !exam.isPublished)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/exam-dates/${exam.id}/edit`}
                        className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                        aria-label={t("examDates.admin.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteExam.bind(null, exam.id)}>
                        <ConfirmSubmitButton confirmMessage={t("examDates.admin.deleteConfirm")} aria-label={t("examDates.admin.delete")}>
                          <Trash2 className="h-4 w-4" />
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/exam-dates" searchParams={sp} />
    </div>
  );
}
