"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileUploadField, type UploadedFile } from "@/components/admin/file-upload-field";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { BOOK_CATEGORY_LABEL } from "@/lib/book-categories";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { BookCategory, ClassLevel, Subject } from "@prisma/client";

type BookFormValues = {
  title: string;
  category: BookCategory;
  classLevel: ClassLevel;
  subjectId: string | null;
  board: string | null;
  medium: string;
  edition: string | null;
  coverUrl: string | null;
  fileUrl: string | null;
  fileSizeBytes: number | null;
  sourceUrl: string | null;
  copyrightCleared: boolean;
  isPublished: boolean;
};

export function BookForm({
  subjects,
  initial,
  action,
}: {
  subjects: Subject[];
  initial?: BookFormValues;
  action: (formData: FormData) => Promise<void>;
}) {
  const { t } = useLocale();
  const [cover, setCover] = useState<UploadedFile | null>(
    initial?.coverUrl ? { path: initial.coverUrl, url: initial.coverUrl, sizeBytes: 0 } : null
  );
  const [file, setFile] = useState<UploadedFile | null>(
    initial?.fileUrl
      ? { path: initial.fileUrl, url: initial.fileUrl, sizeBytes: initial.fileSizeBytes ?? 0 }
      : null
  );

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">{t("books.admin.form.title")}</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="category">{t("books.admin.form.category")}</Label>
          <Select id="category" name="category" defaultValue={initial?.category ?? "NCERT"}>
            {(Object.keys(BOOK_CATEGORY_LABEL) as BookCategory[]).map((value) => (
              <option key={value} value={value}>
                {t(`books.category.${value}`)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="classLevel">{t("books.admin.form.classLevel")}</Label>
          <Select id="classLevel" name="classLevel" defaultValue={initial?.classLevel ?? "CLASS_10"}>
            {Object.entries(CLASS_LEVEL_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subjectId">{t("books.admin.form.subjectOptional")}</Label>
          <Select id="subjectId" name="subjectId" defaultValue={initial?.subjectId ?? ""}>
            <option value="">{t("books.admin.form.none")}</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameHi}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="medium">{t("books.admin.form.medium")}</Label>
          <Select id="medium" name="medium" defaultValue={initial?.medium ?? "HINDI"}>
            <option value="HINDI">{t("books.language.hindi")}</option>
            <option value="ENGLISH">{t("books.language.english")}</option>
            <option value="CHHATTISGARHI">{t("books.language.chhattisgarhi")}</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="board">{t("books.admin.form.board")}</Label>
          <Input
            id="board"
            name="board"
            defaultValue={initial?.board ?? ""}
            placeholder={t("books.admin.form.boardPlaceholder")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edition">{t("books.admin.form.edition")}</Label>
          <Input
            id="edition"
            name="edition"
            defaultValue={initial?.edition ?? ""}
            placeholder={t("books.admin.form.editionPlaceholder")}
          />
        </div>
      </div>

      <FileUploadField
        kind="book-cover"
        accept="image/png,image/jpeg,image/webp"
        label={t("books.admin.form.coverImage")}
        value={cover}
        onChange={setCover}
      />
      <input type="hidden" name="coverUrl" value={cover?.url ?? ""} />

      <FileUploadField
        kind="book-file"
        accept="application/pdf"
        label={t("books.admin.form.pdfUpload")}
        value={file}
        onChange={setFile}
      />
      <input type="hidden" name="fileUrl" value={file?.url ?? ""} />
      <input type="hidden" name="fileSizeBytes" value={file?.sizeBytes ?? ""} />

      <div className="space-y-1.5">
        <Label htmlFor="sourceUrl">{t("books.admin.form.sourceUrl")}</Label>
        <Input
          id="sourceUrl"
          name="sourceUrl"
          type="url"
          defaultValue={initial?.sourceUrl ?? ""}
          placeholder={t("books.admin.form.sourceUrlPlaceholder")}
        />
        <p className="text-xs text-muted-foreground">{t("books.admin.form.sourceHint")}</p>
      </div>

      <label className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-section-examdates)]/30 bg-[color-mix(in_srgb,var(--color-section-examdates)_6%,transparent)] p-3 text-sm">
        <Checkbox name="copyrightCleared" required defaultChecked={initial?.copyrightCleared ?? false} className="mt-0.5" />
        <span>
          {t("books.admin.form.copyrightConfirm")}
          <span className="text-[var(--color-section-examdates)]"> *</span>
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPublished" defaultChecked={initial?.isPublished ?? false} />
        {t("books.admin.form.publishNow")}
      </label>

      <Button type="submit" size="lg">
        {initial ? t("books.admin.form.save") : t("books.admin.form.add")}
      </Button>
    </form>
  );
}
