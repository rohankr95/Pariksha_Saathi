"use client";

import { useActionState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { TeacherFormState } from "@/app/admin/teachers/actions";
import type { ClassLevel } from "@prisma/client";

type Subject = { id: string; nameHi: string; nameEn: string; classLevel: ClassLevel };

const initialState: TeacherFormState = {};

export function TeacherForm({
  subjects,
  initial,
  action,
}: {
  subjects: Subject[];
  initial?: { name: string; email: string; mobile: string | null; subjectIds: string[] };
  action: (prev: TeacherFormState, formData: FormData) => Promise<TeacherFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const { t, locale } = useLocale();

  const byClass = new Map<ClassLevel, Subject[]>();
  for (const s of subjects) {
    if (!byClass.has(s.classLevel)) byClass.set(s.classLevel, []);
    byClass.get(s.classLevel)!.push(s);
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">{t("admin.teachers.form.name")}</Label>
        <Input id="name" name="name" required defaultValue={initial?.name} />
      </div>

      {!initial && (
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("admin.teachers.form.email")}</Label>
          <Input id="email" name="email" type="email" required />
          <p className="text-xs text-muted-foreground">{t("admin.teachers.form.emailHint")}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="mobile">{t("admin.teachers.form.mobile")}</Label>
        <Input id="mobile" name="mobile" defaultValue={initial?.mobile ?? ""} placeholder="98XXXXXXXX" />
      </div>

      <div className="space-y-2">
        <Label>{t("admin.teachers.form.subjects")}</Label>
        <div className="space-y-3">
          {Array.from(byClass.entries()).map(([classLevel, list]) => (
            <div key={classLevel}>
              <p className="mb-1.5 text-xs font-semibold text-muted-foreground">{CLASS_LEVEL_LABEL[classLevel]}</p>
              <div className="flex flex-wrap gap-3">
                {list.map((s) => (
                  <label key={s.id} className="flex items-center gap-1.5 text-sm">
                    <Checkbox name="subjects" value={s.id} defaultChecked={initial?.subjectIds?.includes(s.id) ?? false} />
                    {locale === "hi" ? s.nameHi : s.nameEn}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-[var(--color-section-examdates)]">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t("admin.teachers.form.saving") : initial ? t("admin.teachers.form.save") : t("admin.teachers.form.add")}
      </Button>
    </form>
  );
}
