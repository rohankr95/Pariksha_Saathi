import Link from "next/link";
import { Pencil, Trash2, BookOpen, ListTree } from "lucide-react";
import { getAdminSubjects } from "@/lib/queries/admin-subjects";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { ActiveToggle } from "@/components/admin/active-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { getT } from "@/lib/i18n/server";
import { toggleSubjectActive, deleteSubject } from "./actions";

export default async function AdminSubjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const t = await getT();
  const { items, total, totalPages } = await getAdminSubjects({ q: sp.q, page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">{t("admin.subjects.listTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.subjects.totalCount", { count: total })}</p>
      </div>

      <AdminListToolbar
        searchPlaceholder={t("admin.subjects.searchPlaceholder")}
        defaultSearch={sp.q}
        addHref="/admin/subjects/new"
        addLabel={t("admin.subjects.addNew")}
      />

      {items.length === 0 ? (
        <EmptyState icon={BookOpen} title={t("admin.subjects.emptyTitle")} description={t("admin.subjects.emptyDesc")} />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">{t("admin.subjects.colName")}</th>
                <th className="p-3">{t("admin.subjects.colClass")}</th>
                <th className="p-3">{t("admin.subjects.colChapters")}</th>
                <th className="p-3">{t("admin.subjects.colStatus")}</th>
                <th className="p-3 text-right">{t("admin.subjects.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((s) => {
                const inUse =
                  s._count.lectures + s._count.notes + s._count.quizzes + s._count.classRequests + s._count.answerCopies > 0;
                return (
                  <tr key={s.id}>
                    <td className="p-3 font-medium">
                      {s.icon && <span className="mr-1.5">{s.icon}</span>}
                      {s.nameHi}
                      {s.nameEn && <span className="ml-1.5 text-xs text-muted-foreground">({s.nameEn})</span>}
                    </td>
                    <td className="p-3 text-muted-foreground">{CLASS_LEVEL_LABEL[s.classLevel]}</td>
                    <td className="p-3 text-muted-foreground">{s._count.chapters}</td>
                    <td className="p-3">
                      <ActiveToggle
                        isActive={s.isActive}
                        activeLabel={t("admin.subjects.active")}
                        inactiveLabel={t("admin.subjects.inactive")}
                        action={toggleSubjectActive.bind(null, s.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/subjects/${s.id}/chapters`}
                          className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                          aria-label={t("admin.subjects.manageChapters")}
                          title={t("admin.subjects.manageChapters")}
                        >
                          <ListTree className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/subjects/${s.id}/edit`}
                          className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                          aria-label={t("admin.subjects.edit")}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        {!inUse && (
                          <form action={deleteSubject.bind(null, s.id)}>
                            <ConfirmSubmitButton confirmMessage={t("admin.subjects.deleteConfirm")} aria-label={t("admin.subjects.delete")}>
                              <Trash2 className="h-4 w-4" />
                            </ConfirmSubmitButton>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/subjects" searchParams={sp} />
    </div>
  );
}
