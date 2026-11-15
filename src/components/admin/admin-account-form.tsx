"use client";

import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";
import { createAdmin, type AdminFormState } from "@/app/admin/administrators/actions";

const initialState: AdminFormState = {};

export function AdminAccountForm() {
  const [state, formAction, pending] = useActionState(createAdmin, initialState);
  const { t } = useLocale();
  const v = state.values;

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-border bg-surface-muted px-3 py-2.5 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-section-answercopies)]" aria-hidden="true" />
        {t("admin.administrators.form.notice")}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">{t("admin.administrators.form.name")}</Label>
        <Input id="name" name="name" required minLength={2} maxLength={100} autoComplete="off" defaultValue={v?.name} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">{t("admin.administrators.form.email")}</Label>
        <Input id="email" name="email" type="email" required autoComplete="off" defaultValue={v?.email} />
        <p className="text-xs text-muted-foreground">{t("admin.administrators.form.emailHint")}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mobile">{t("admin.administrators.form.mobile")}</Label>
        <Input id="mobile" name="mobile" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} placeholder="98XXXXXXXX" defaultValue={v?.mobile} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("admin.administrators.form.password")}</Label>
          <Input id="password" name="password" type="password" required minLength={8} maxLength={100} autoComplete="new-password" />
          <p className="text-xs text-muted-foreground">{t("admin.administrators.form.passwordHint")}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t("admin.administrators.form.confirmPassword")}</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} maxLength={100} autoComplete="new-password" />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-[var(--color-section-examdates)]">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t("admin.administrators.form.saving") : t("admin.administrators.form.add")}
      </Button>
    </form>
  );
}
