"use client";

import { useActionState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { ChapterFormState } from "@/app/admin/subjects/[id]/chapters/actions";

const initialState: ChapterFormState = {};

export function ChapterForm({
  initial,
  action,
}: {
  initial?: { nameHi: string; nameEn: string | null };
  action: (prev: ChapterFormState, formData: FormData) => Promise<ChapterFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const { t } = useLocale();

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="nameHi">{t("admin.subjects.chapters.form.nameHi")}</Label>
        <Input id="nameHi" name="nameHi" required defaultValue={initial?.nameHi} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="nameEn">{t("admin.subjects.chapters.form.nameEn")}</Label>
        <Input id="nameEn" name="nameEn" required defaultValue={initial?.nameEn ?? ""} />
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
