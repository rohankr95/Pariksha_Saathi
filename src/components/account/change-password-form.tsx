"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";
import { changePassword, type ChangePasswordState } from "@/app/account/actions";

const initialState: ChangePasswordState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);
  const { t } = useLocale();

  return (
    <form action={formAction} className="space-y-5" key={state.success ? "done" : "form"}>
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">{t("account.security.currentPassword")}</Label>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">{t("account.security.newPassword")}</Label>
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={6} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">{t("account.security.confirmPassword")}</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={6} />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-[var(--color-section-examdates)]">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="flex items-center gap-1.5 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" /> {t("account.security.success")}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t("account.security.saving") : t("account.security.submit")}
      </Button>
    </form>
  );
}
