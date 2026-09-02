import Link from "next/link";
import { Pencil, Trash2, Lightbulb, ListChecks } from "lucide-react";
import { getAdminQuizzes } from "@/lib/queries/admin-quizzes";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getT } from "@/lib/i18n/server";
import { toggleQuizPublish, deleteQuiz } from "./actions";

export default async function AdminQuizzesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const t = await getT();
  const { items, total, totalPages } = await getAdminQuizzes({ q: sp.q, page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">{t("quiz.admin.listTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("quiz.admin.totalCount", { count: total })}</p>
      </div>

      <AdminListToolbar
        searchPlaceholder={t("quiz.admin.searchPlaceholder")}
        defaultSearch={sp.q}
        addHref="/admin/quizzes/new"
        addLabel={t("quiz.admin.addNew")}
      />

      {items.length === 0 ? (
        <EmptyState icon={Lightbulb} title={t("quiz.admin.emptyTitle")} description={t("quiz.admin.emptyDesc")} />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">{t("quiz.admin.colTitle")}</th>
                <th className="p-3">{t("quiz.admin.colSubject")}</th>
                <th className="p-3">{t("quiz.admin.colQuestions")}</th>
                <th className="p-3">{t("quiz.admin.colStatus")}</th>
                <th className="p-3 text-right">{t("quiz.admin.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((quiz) => (
                <tr key={quiz.id}>
                  <td className="max-w-xs p-3 font-medium">
                    {quiz.title}
                    {quiz._count.questions === 0 && (
                      <Badge variant="accent" className="ml-2 text-[10px]">
                        {t("quiz.admin.noQuestionsBadge")}
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {quiz.subject.nameHi}
                    {quiz.chapter && <><br /><span className="text-xs">{quiz.chapter.nameHi}</span></>}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {t("quiz.admin.questionsAndAttempts", { questions: quiz._count.questions, attempts: quiz._count.attempts })}
                  </td>
                  <td className="p-3">
                    <PublishToggle
                      isPublished={quiz.isPublished}
                      action={toggleQuizPublish.bind(null, quiz.id, !quiz.isPublished)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/quizzes/${quiz.id}/questions`}
                        className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                        aria-label={t("quiz.admin.manageQuestions")}
                        title={t("quiz.admin.manageQuestions")}
                      >
                        <ListChecks className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/quizzes/${quiz.id}/edit`}
                        className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                        aria-label={t("quiz.admin.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteQuiz.bind(null, quiz.id)}>
                        <ConfirmSubmitButton confirmMessage={t("quiz.admin.deleteConfirm")} aria-label={t("quiz.admin.delete")}>
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

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/quizzes" searchParams={sp} />
    </div>
  );
}
