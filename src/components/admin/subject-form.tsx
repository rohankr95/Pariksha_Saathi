"use client";

import { useActionState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { SubjectFormState } from "@/app/admin/subjects/actions";
import type { ClassLevel } from "@prisma/client";

const initialState: SubjectFormState = {};

export function SubjectForm({
  initial,
  action,
}: {
  initial?: { nameHi: string; nameEn: string | null; classLevel: ClassLevel; icon: string | null; colorKey: string | null };
  action: (prev: SubjectFormState, formData: FormData) => Promise<SubjectFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const { t } = useLocale();

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="nameHi">{t("admin.subjects.form.nameHi")}</Label>
        <Input id="nameHi" name="nameHi" required defaultValue={initial?.nameHi} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="nameEn">{t("admin.subjects.form.nameEn")}</Label>
        <Input id="nameEn" name="nameEn" required defaultValue={initial?.nameEn ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="classLevel">{t("admin.subjects.form.classLevel")}</Label>
        <Select id="classLevel" name="classLevel" required defaultValue={initial?.classLevel}>
          {(Object.keys(CLASS_LEVEL_LABEL) as ClassLevel[]).map((cl) => (
            <option key={cl} value={cl}>
              {CLASS_LEVEL_LABEL[cl]}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="icon">{t("admin.subjects.form.icon")}</Label>
          <Input id="icon" name="icon" placeholder="📘" defaultValue={initial?.icon ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="colorKey">{t("admin.subjects.form.colorKey")}</Label>
          <Input id="colorKey" name="colorKey" placeholder="indigo" defaultValue={initial?.colorKey ?? ""} />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-[var(--color-section-examdates)]">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t("admin.subjects.form.saving") : initial ? t("admin.subjects.form.save") : t("admin.subjects.form.add")}
      </Button>
    </form>
  );
}
