"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileUploadField, type UploadedFile } from "@/components/admin/file-upload-field";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { ClassLevel } from "@prisma/client";

const CATEGORY_SUGGESTIONS = ["Board Exam", "Entrance Exam", "Scholarship Exam", "Competitive Exam"];

type ExamFormValues = {
  name: string;
  body: string;
  category: string;
  applyStart: Date | null;
  applyEnd: Date | null;
  examDate: Date | null;
  resultDate: Date | null;
  officialUrl: string | null;
  notificationUrl: string | null;
  classes: ClassLevel[];
  isPublished: boolean;
};

function toDateInputValue(d: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function ExamForm({
  initial,
  action,
}: {
  initial?: ExamFormValues;
  action: (formData: FormData) => Promise<void>;
}) {
  const [notification, setNotification] = useState<UploadedFile | null>(
    initial?.notificationUrl ? { path: initial.notificationUrl, url: initial.notificationUrl, sizeBytes: 0 } : null
  );
  const { t } = useLocale();

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">{t("examDates.form.name")}</Label>
        <Input id="name" name="name" required defaultValue={initial?.name} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="body">{t("examDates.form.body")}</Label>
          <Input id="body" name="body" required defaultValue={initial?.body} placeholder="CGBSE" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">{t("examDates.form.category")}</Label>
          <Input id="category" name="category" required list="category-suggestions" defaultValue={initial?.category} />
          <datalist id="category-suggestions">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="applyStart">{t("examDates.form.applyStart")}</Label>
          <Input id="applyStart" name="applyStart" type="date" defaultValue={toDateInputValue(initial?.applyStart ?? null)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="applyEnd">{t("examDates.form.applyEnd")}</Label>
          <Input id="applyEnd" name="applyEnd" type="date" defaultValue={toDateInputValue(initial?.applyEnd ?? null)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="examDate">{t("examDates.form.examDate")}</Label>
          <Input id="examDate" name="examDate" type="date" defaultValue={toDateInputValue(initial?.examDate ?? null)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="resultDate">{t("examDates.form.resultDate")}</Label>
          <Input id="resultDate" name="resultDate" type="date" defaultValue={toDateInputValue(initial?.resultDate ?? null)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="officialUrl">{t("examDates.form.officialUrl")}</Label>
        <Input id="officialUrl" name="officialUrl" type="url" defaultValue={initial?.officialUrl ?? ""} />
      </div>

      <FileUploadField
        kind="exam-notification"
        accept="application/pdf"
        label={t("examDates.form.notificationPdf")}
        value={notification}
        onChange={setNotification}
      />
      <input type="hidden" name="notificationUrl" value={notification?.url ?? ""} />

      <div className="space-y-1.5">
        <Label>{t("examDates.form.applicableClasses")}</Label>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(CLASS_LEVEL_LABEL) as ClassLevel[]).map((c) => (
            <label key={c} className="flex items-center gap-1.5 text-sm">
              <Checkbox name="classes" value={c} defaultChecked={initial?.classes?.includes(c) ?? false} />
              {CLASS_LEVEL_LABEL[c]}
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPublished" defaultChecked={initial?.isPublished ?? false} />
        {t("examDates.form.publishNow")}
      </label>

      <Button type="submit" size="lg">
        {initial ? t("examDates.form.save") : t("examDates.form.add")}
      </Button>
    </form>
  );
}
