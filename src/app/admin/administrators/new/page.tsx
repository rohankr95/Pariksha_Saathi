import { requireRole } from "@/lib/require-role";
import { AdminAccountForm } from "@/components/admin/admin-account-form";
import { getT } from "@/lib/i18n/server";

export default async function NewAdminPage() {
  await requireRole(["SUPER_ADMIN"]);
  const t = await getT();
  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("admin.administrators.newTitle")}</h1>
      <AdminAccountForm />
    </div>
  );
}
