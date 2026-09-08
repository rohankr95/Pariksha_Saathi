"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileUploadField, type UploadedFile } from "@/components/admin/file-upload-field";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { ClassLevel } from "@prisma/client";

type TopperFormValues = {
  studentName: string;
  fatherName: string | null;
  motherName: string | null;
  school: string;
  block: string | null;
  classLevel: ClassLevel;
  examYear: number;
  percentage: number | null;
  rank: number | null;
  photoUrl: string | null;
  displayOrder: number;
  isPublished: boolean;
};

export function TopperForm({
  initial,
  action,
}: {
  initial?: TopperFormValues;
  action: (formData: FormData) => Promise<void>;
}) {
  const { t } = useLocale();
  const [photo, setPhoto] = useState<UploadedFile | null>(
    initial?.photoUrl ? { path: initial.photoUrl, url: initial.photoUrl, sizeBytes: 0 } : null
  );
  const currentYear = new Date().getFullYear();

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="studentName">{t("toppers.admin.form.studentName")}</Label>
        <Input id="studentName" name="studentName" required defaultValue={initial?.studentName} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fatherName">{t("toppers.admin.form.fatherName")}</Label>
          <Input id="fatherName" name="fatherName" defaultValue={initial?.fatherName ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="motherName">{t("toppers.admin.form.motherName")}</Label>
          <Input id="motherName" name="motherName" defaultValue={initial?.motherName ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="school">{t("toppers.admin.form.school")}</Label>
          <Input id="school" name="school" required defaultValue={initial?.school} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="block">{t("toppers.admin.form.block")}</Label>
          <Input id="block" name="block" defaultValue={initial?.block ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="classLevel">{t("toppers.admin.form.classLevel")}</Label>
          <Select id="classLevel" name="classLevel" defaultValue={initial?.classLevel ?? "CLASS_10"}>
            {(["CLASS_10", "CLASS_12"] as const).map((value) => (
              <option key={value} value={value}>
                {CLASS_LEVEL_LABEL[value]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="examYear">{t("toppers.admin.form.examYear")}</Label>
          <Input
            id="examYear"
            name="examYear"
            type="number"
            required
            defaultValue={initial?.examYear ?? currentYear}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="percentage">{t("toppers.admin.form.percentage")}</Label>
          <Input
            id="percentage"
            name="percentage"
            type="number"
            step="0.01"
            min={0}
            max={100}
            defaultValue={initial?.percentage ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rank">{t("toppers.admin.form.rank")}</Label>
          <Input id="rank" name="rank" type="number" min={1} defaultValue={initial?.rank ?? ""} />
        </div>
      </div>

      <FileUploadField
        kind="topper-photo"
        accept="image/png,image/jpeg,image/webp"
        label={t("toppers.admin.form.photo")}
        value={photo}
        onChange={setPhoto}
      />
      <input type="hidden" name="photoUrl" value={photo?.url ?? ""} />

      <div className="space-y-1.5">
        <Label htmlFor="displayOrder">{t("toppers.admin.form.displayOrder")}</Label>
        <Input
          id="displayOrder"
          name="displayOrder"
          type="number"
          defaultValue={initial?.displayOrder ?? 0}
        />
        <p className="text-xs text-muted-foreground">{t("toppers.admin.form.displayOrderHint")}</p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPublished" defaultChecked={initial?.isPublished ?? false} />
        {t("toppers.admin.form.publishNow")}
      </label>

      <Button type="submit" size="lg">
        {initial ? t("toppers.admin.form.saveChanges") : t("toppers.admin.form.addTopper")}
      </Button>
    </form>
  );
}
