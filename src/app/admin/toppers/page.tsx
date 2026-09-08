import Link from "next/link";
import { Pencil, Trash2, Trophy } from "lucide-react";
import { getAdminToppers } from "@/lib/queries/toppers";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { toggleTopperPublish, deleteTopper } from "./actions";
import { getT } from "@/lib/i18n/server";

export default async function AdminToppersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const t = await getT();
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, totalPages } = await getAdminToppers({ q: sp.q, page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">{t("toppers.admin.listTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("toppers.admin.totalCount", { count: total })}</p>
      </div>

      <AdminListToolbar
        searchPlaceholder={t("toppers.admin.searchPlaceholder")}
        defaultSearch={sp.q}
        addHref="/admin/toppers/new"
        addLabel={t("toppers.admin.addLabel")}
      />

      {items.length === 0 ? (
        <EmptyState icon={Trophy} title={t("toppers.admin.emptyTitle")} description={t("toppers.admin.emptyDesc")} />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">{t("toppers.admin.table.student")}</th>
                <th className="p-3">{t("toppers.admin.table.school")}</th>
                <th className="p-3">{t("toppers.admin.table.class")}</th>
                <th className="p-3">{t("toppers.admin.table.year")}</th>
                <th className="p-3">{t("toppers.admin.table.status")}</th>
                <th className="p-3 text-right">{t("toppers.admin.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((topper) => (
                <tr key={topper.id}>
                  <td className="max-w-xs p-3 font-medium">{topper.studentName}</td>
                  <td className="p-3 text-muted-foreground">{topper.school}</td>
                  <td className="p-3 text-muted-foreground">{CLASS_LEVEL_LABEL[topper.classLevel]}</td>
                  <td className="p-3 text-muted-foreground">{topper.examYear}</td>
                  <td className="p-3">
                    <PublishToggle
                      isPublished={topper.isPublished}
                      action={toggleTopperPublish.bind(null, topper.id, !topper.isPublished)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/toppers/${topper.id}/edit`}
                        className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                        aria-label={t("toppers.admin.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteTopper.bind(null, topper.id)}>
                        <ConfirmSubmitButton
                          confirmMessage={t("toppers.admin.confirmDelete")}
                          aria-label={t("toppers.admin.delete")}
                        >
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

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/toppers" searchParams={sp} />
    </div>
  );
}
