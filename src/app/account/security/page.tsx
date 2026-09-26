import { Card } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { requireUser } from "@/lib/require-role";
import { getT } from "@/lib/i18n/server";

export default async function AccountSecurityPage() {
  await requireUser();
  const t = await getT();

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="font-sans text-2xl font-bold text-foreground">{t("account.security.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("account.security.subtitle")}</p>
      <Card className="mt-6 p-6">
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
