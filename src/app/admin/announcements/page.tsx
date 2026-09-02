import Link from "next/link";
import { Pencil, Trash2, Megaphone } from "lucide-react";
import { getAdminAnnouncements } from "@/lib/queries/admin-announcements";
import { AdminPagination } from "@/components/admin/pagination";
import { ActiveToggle } from "@/components/admin/active-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getT, getServerLocale } from "@/lib/i18n/server";
import { deleteAnnouncement, toggleAnnouncementActive } from "./actions";

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const t = await getT();
  const locale = await getServerLocale();
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, totalPages } = await getAdminAnnouncements({ page });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground">{t("admin.announcements.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.announcements.totalCount", { count: total })}</p>
        </div>
        <Link href="/admin/announcements/new">
          <Button size="sm">{t("admin.announcements.addLabel")}</Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Megaphone} title={t("admin.announcements.empty")} description={t("admin.announcements.emptyDesc")} />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">{t("admin.announcements.colText")}</th>
                <th className="p-3">{t("admin.announcements.colExpires")}</th>
                <th className="p-3">{t("admin.announcements.colStatus")}</th>
                <th className="p-3 text-right">{t("admin.announcements.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((a) => (
                <tr key={a.id}>
                  <td className="max-w-md p-3 font-medium">{locale === "hi" ? a.textHi : a.textEn || a.textHi}</td>
                  <td className="p-3 text-muted-foreground">
                    {a.expiresAt
                      ? new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" }).format(a.expiresAt)
                      : t("admin.announcements.noExpiry")}
                  </td>
                  <td className="p-3">
                    <ActiveToggle
                      isActive={a.isActive}
                      activeLabel={t("admin.announcements.active")}
                      inactiveLabel={t("admin.announcements.inactive")}
                      action={toggleAnnouncementActive.bind(null, a.id)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/announcements/${a.id}/edit`}
                        className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                        aria-label={t("admin.announcements.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteAnnouncement.bind(null, a.id)}>
                        <ConfirmSubmitButton confirmMessage={t("admin.announcements.deleteConfirm")} aria-label={t("admin.announcements.delete")}>
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

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/announcements" searchParams={sp} />
    </div>
  );
}
