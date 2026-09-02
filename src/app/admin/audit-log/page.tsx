import { ScrollText } from "lucide-react";
import { getAdminAuditLog } from "@/lib/queries/admin-audit-log";
import { AdminPagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getT, getServerLocale } from "@/lib/i18n/server";

const ACTIONS = ["CREATE", "UPDATE", "DELETE", "RESTORE", "PUBLISH", "UNPUBLISH"] as const;

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const t = await getT();
  const locale = await getServerLocale();
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, totalPages, entities } = await getAdminAuditLog({ entity: sp.entity, action: sp.action, page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">{t("admin.auditLog.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.auditLog.totalCount", { count: total })}</p>
      </div>

      <form action="/admin/audit-log" className="mb-4 flex flex-wrap gap-2.5">
        <Select name="action" defaultValue={sp.action ?? ""} className="max-w-[180px]">
          <option value="">{t("admin.auditLog.allActions")}</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {t(`admin.auditLog.action.${a}`)}
            </option>
          ))}
        </Select>
        <Select name="entity" defaultValue={sp.entity ?? ""} className="max-w-[200px]">
          <option value="">{t("admin.auditLog.allEntities")}</option>
          {entities.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm" variant="outline">
          {t("admin.auditLog.applyFilter")}
        </Button>
      </form>

      {items.length === 0 ? (
        <EmptyState icon={ScrollText} title={t("admin.auditLog.empty")} />
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">{t("admin.auditLog.colTime")}</th>
                <th className="p-3">{t("admin.auditLog.colUser")}</th>
                <th className="p-3">{t("admin.auditLog.colAction")}</th>
                <th className="p-3">{t("admin.auditLog.colEntity")}</th>
                <th className="p-3">{t("admin.auditLog.colDetails")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((entry) => (
                <tr key={entry.id}>
                  <td className="whitespace-nowrap p-3 text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "Asia/Kolkata",
                    }).format(entry.createdAt)}
                  </td>
                  <td className="p-3 font-medium">{entry.user?.name ?? t("admin.auditLog.unknownUser")}</td>
                  <td className="p-3">{t(`admin.auditLog.action.${entry.action}`)}</td>
                  <td className="p-3 text-muted-foreground">
                    {entry.entity}
                    {entry.entityId ? <span className="text-xs"> · {entry.entityId.slice(0, 8)}</span> : null}
                  </td>
                  <td className="max-w-xs truncate p-3 text-xs text-muted-foreground">
                    {entry.metaJson ? JSON.stringify(entry.metaJson) : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/audit-log" searchParams={sp} />
    </div>
  );
}
