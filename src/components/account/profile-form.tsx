"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BlockSelect } from "@/components/account/block-select";
import { useLocale } from "@/lib/i18n/locale-provider";
import { updateProfile, type UpdateProfileState } from "@/app/account/actions";

export type ProfileFormData = {
  isStudent: boolean;
  name: string;
  email: string;
  mobile: string | null;
  classLevel: string | null;
  school: string | null;
  block: string | null;
  displayName: string | null;
  onLeaderboard: boolean;
};

const initialState: UpdateProfileState = {};

export function ProfileForm({ initial }: { initial: ProfileFormData }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);
  const { t } = useLocale();
  const v: ProfileFormData = state.values ? { ...initial, ...state.values } : initial;

  return (
    <form action={formAction} className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="mb-1 text-sm font-semibold text-foreground">{t("account.profile.sectionAccount")}</legend>
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("account.profile.name")}</Label>
          <Input id="name" name="name" defaultValue={v.name} required minLength={2} maxLength={100} autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("account.profile.email")}</Label>
          <Input id="email" name="email" type="email" defaultValue={v.email} required autoComplete="email" />
          <p className="text-xs text-muted-foreground">{t("account.profile.emailHint")}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mobile">
            {initial.isStudent ? t("account.profile.mobile") : t("account.profile.mobileOptional")}
          </Label>
          <Input
            id="mobile"
            name="mobile"
            type="tel"
            inputMode="numeric"
            defaultValue={v.mobile ?? ""}
            required={initial.isStudent}
            pattern="[6-9][0-9]{9}"
            maxLength={10}
            autoComplete="tel"
          />
        </div>
      </fieldset>

      {initial.isStudent && (
        <fieldset className="space-y-4 border-t border-border pt-5">
          <legend className="mb-1 text-sm font-semibold text-foreground">{t("account.profile.sectionStudent")}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="classLevel">{t("account.profile.classLevel")}</Label>
              <Select id="classLevel" name="classLevel" required defaultValue={v.classLevel || "CLASS_10"}>
                <option value="CLASS_9">9</option>
                <option value="CLASS_10">10</option>
                <option value="CLASS_11">11</option>
                <option value="CLASS_12">12</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="block">{t("account.profile.block")}</Label>
              <BlockSelect key={v.block ?? ""} defaultValue={v.block} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="school">{t("account.profile.school")}</Label>
            <Input id="school" name="school" defaultValue={v.school ?? ""} required minLength={2} maxLength={150} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="displayName">{t("account.profile.displayName")}</Label>
            <Input id="displayName" name="displayName" defaultValue={v.displayName ?? ""} maxLength={40} />
            <p className="text-xs text-muted-foreground">{t("account.profile.displayNameHint")}</p>
          </div>
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="onLeaderboard"
              defaultChecked={v.onLeaderboard}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            {t("account.profile.onLeaderboard")}
          </label>
        </fieldset>
      )}

      {state.error && (
        <p role="alert" className="text-sm text-[var(--color-section-examdates)]">
          {state.error}
        </p>
      )}
      {state.success && !pending && (
        <p role="status" className="flex items-center gap-1.5 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" /> {t("account.profile.success")}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t("account.profile.saving") : t("account.profile.submit")}
      </Button>
    </form>
  );
}
