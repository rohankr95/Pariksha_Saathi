import { KeyRound, ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/require-role";
import { getAdminAdmins } from "@/lib/queries/admin-admins";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { ActiveToggle } from "@/components/admin/active-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { getT } from "@/lib/i18n/server";
import { toggleAdminActive, resetAdminPassword } from "./actions";

function formatDate(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default async function AdminAdministratorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await requireRole(["SUPER_ADMIN"]);
  const t = await getT();
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, activeCount, totalPages } = await getAdminAdmins({ q: sp.q, page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">{t("admin.administrators.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.administrators.subtitle", { count: total })}</p>
      </div>

      <AdminListToolbar
        searchPlaceholder={t("admin.administrators.searchPlaceholder")}
        defaultSearch={sp.q}
        addHref="/admin/administrators/new"
        addLabel={t("admin.administrators.addLabel")}
      />

      {items.length === 0 ? (
        <EmptyState icon={ShieldCheck} title={t("admin.administrators.empty")} />
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">{t("admin.administrators.colName")}</th>
                <th className="p-3">{t("admin.administrators.colContact")}</th>
                <th className="p-3">{t("admin.administrators.colCreated")}</th>
                <th className="p-3">{t("admin.administrators.colStatus")}</th>
                <th className="p-3 text-right">{t("admin.administrators.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((admin) => {
                const isSelf = admin.id === session.user.id;
                // The only active admin can't be deactivated — guarded server-side too.
                const lockToggle = admin.isActive && activeCount <= 1;
                return (
                  <tr key={admin.id}>
                    <td className="max-w-xs p-3 font-medium">
                      {admin.name}
                      {isSelf && (
                        <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {t("admin.administrators.you")}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {admin.email}
                      {admin.mobile ? (
                        <>
                          <br />
                          {admin.mobile}
                        </>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap p-3 text-xs text-muted-foreground">{formatDate(admin.createdAt)}</td>
                    <td className="p-3">
                      {isSelf || lockToggle ? (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            admin.isActive ? "bg-success/15 text-success" : "bg-surface-muted text-muted-foreground"
                          }`}
                        >
                          {admin.isActive ? t("admin.administrators.active") : t("admin.administrators.inactive")}
                        </span>
                      ) : (
                        <ActiveToggle
                          isActive={admin.isActive}
                          activeLabel={t("admin.administrators.active")}
                          inactiveLabel={t("admin.administrators.inactive")}
                          action={toggleAdminActive.bind(null, admin.id)}
                        />
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        {isSelf ? (
                          <span className="text-xs text-muted-foreground">{t("admin.administrators.selfHint")}</span>
                        ) : (
                          <form action={resetAdminPassword.bind(null, admin.id)}>
                            <ConfirmSubmitButton
                              confirmMessage={t("admin.administrators.resetConfirm")}
                              aria-label={t("admin.administrators.resetPassword")}
                            >
                              <KeyRound className="h-4 w-4" />
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

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/administrators" searchParams={sp} />
    </div>
  );
}
