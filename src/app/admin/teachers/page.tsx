import Link from "next/link";
import { Pencil, KeyRound, Users } from "lucide-react";
import { getAdminTeachers } from "@/lib/queries/admin-teachers";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { ActiveToggle } from "@/components/admin/active-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { getT, getServerLocale } from "@/lib/i18n/server";
import { toggleTeacherActive, resetTeacherPassword } from "./actions";

export default async function AdminTeachersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const t = await getT();
  const locale = await getServerLocale();
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, totalPages } = await getAdminTeachers({ q: sp.q, page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">{t("admin.teachers.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.teachers.totalTeachers", { count: total })}</p>
      </div>

      <AdminListToolbar
        searchPlaceholder={t("admin.teachers.searchPlaceholder")}
        defaultSearch={sp.q}
        addHref="/admin/teachers/new"
        addLabel={t("admin.teachers.addLabel")}
      />

      {items.length === 0 ? (
        <EmptyState icon={Users} title={t("admin.teachers.empty")} description={t("admin.teachers.emptyDesc")} />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">{t("admin.teachers.colName")}</th>
                <th className="p-3">{t("admin.teachers.colContact")}</th>
                <th className="p-3">{t("admin.teachers.colSubjects")}</th>
                <th className="p-3">{t("admin.teachers.colStatus")}</th>
                <th className="p-3 text-right">{t("admin.teachers.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="max-w-xs p-3 font-medium">{teacher.name}</td>
                  <td className="p-3 text-muted-foreground">
                    {teacher.email}
                    {teacher.mobile ? <><br />{teacher.mobile}</> : null}
                  </td>
                  <td className="max-w-xs p-3 text-xs text-muted-foreground">
                    {teacher.subjects.length > 0
                      ? teacher.subjects.map((s) => (locale === "hi" ? s.nameHi : s.nameEn)).join(", ")
                      : t("admin.teachers.noSubjects")}
                  </td>
                  <td className="p-3">
                    <ActiveToggle
                      isActive={teacher.isActive}
                      activeLabel={t("admin.teachers.active")}
                      inactiveLabel={t("admin.teachers.inactive")}
                      action={toggleTeacherActive.bind(null, teacher.id)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/teachers/${teacher.id}/edit`}
                        className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                        aria-label={t("admin.teachers.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={resetTeacherPassword.bind(null, teacher.id)}>
                        <ConfirmSubmitButton confirmMessage={t("admin.teachers.resetConfirm")} aria-label={t("admin.teachers.resetPassword")}>
                          <KeyRound className="h-4 w-4" />
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

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/teachers" searchParams={sp} />
    </div>
  );
}
