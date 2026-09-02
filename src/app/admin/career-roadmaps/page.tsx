import Link from "next/link";
import { Pencil, Trash2, Compass } from "lucide-react";
import { getAdminRoadmaps } from "@/lib/queries/admin-roadmaps";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { getT } from "@/lib/i18n/server";
import { toggleRoadmapPublish, deleteRoadmap } from "./actions";

export default async function AdminRoadmapsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const t = await getT();
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, totalPages } = await getAdminRoadmaps({ q: sp.q, page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">{t("career.admin.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("career.admin.totalRoadmaps", { count: total })}</p>
      </div>

      <AdminListToolbar
        searchPlaceholder={t("career.admin.searchPlaceholder")}
        defaultSearch={sp.q}
        addHref="/admin/career-roadmaps/new"
        addLabel={t("career.admin.addLabel")}
      />

      {items.length === 0 ? (
        <EmptyState icon={Compass} title={t("career.admin.empty")} description={t("career.admin.emptyDesc")} />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">{t("career.admin.colTitle")}</th>
                <th className="p-3">{t("career.admin.colStream")}</th>
                <th className="p-3">{t("career.admin.colStatus")}</th>
                <th className="p-3 text-right">{t("career.admin.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((roadmap) => (
                <tr key={roadmap.id}>
                  <td className="max-w-xs p-3 font-medium">{roadmap.title}</td>
                  <td className="p-3 text-muted-foreground">{roadmap.stream}</td>
                  <td className="p-3">
                    <PublishToggle
                      isPublished={roadmap.isPublished}
                      action={toggleRoadmapPublish.bind(null, roadmap.id, !roadmap.isPublished)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/career-roadmaps/${roadmap.id}/edit`}
                        className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                        aria-label={t("career.admin.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteRoadmap.bind(null, roadmap.id)}>
                        <ConfirmSubmitButton confirmMessage={t("career.admin.deleteConfirm")} aria-label={t("career.admin.delete")}>
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

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/career-roadmaps" searchParams={sp} />
    </div>
  );
}
