"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/admin/tag-input";
import { FileUploadField, type UploadedFile } from "@/components/admin/file-upload-field";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { NOTE_TAGS } from "@/lib/note-tags";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { ClassLevel, Chapter, Subject } from "@prisma/client";

type NoteFormValues = {
  title: string;
  subjectId: string;
  chapterId: string | null;
  classLevel: ClassLevel;
  language: string;
  tags: string[];
  fileUrl: string;
  fileSizeBytes: number;
  isPublished: boolean;
};

export function NoteForm({
  subjects,
  chapters,
  initial,
  action,
}: {
  subjects: Subject[];
  chapters: Chapter[];
  initial?: NoteFormValues;
  action: (formData: FormData) => Promise<void>;
}) {
  const { t } = useLocale();
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? subjects[0]?.id ?? "");
  const [file, setFile] = useState<UploadedFile | null>(
    initial ? { path: initial.fileUrl, url: initial.fileUrl, sizeBytes: initial.fileSizeBytes } : null
  );
  const filteredChapters = chapters.filter((c) => c.subjectId === subjectId);

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">{t("notes.admin.form.title")}</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="classLevel">{t("notes.admin.form.classLevel")}</Label>
          <Select id="classLevel" name="classLevel" defaultValue={initial?.classLevel ?? "CLASS_10"}>
            {Object.entries(CLASS_LEVEL_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="language">{t("notes.admin.form.language")}</Label>
          <Select id="language" name="language" defaultValue={initial?.language ?? "HINDI"}>
            <option value="HINDI">{t("notes.language.hindi")}</option>
            <option value="ENGLISH">{t("notes.language.english")}</option>
            <option value="CHHATTISGARHI">{t("notes.language.chhattisgarhi")}</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subjectId">{t("notes.admin.form.subject")}</Label>
          <Select
            id="subjectId"
            name="subjectId"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameHi}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="chapterId">{t("notes.admin.form.chapter")}</Label>
          <Select id="chapterId" name="chapterId" defaultValue={initial?.chapterId ?? ""}>
            <option value="">{t("notes.admin.form.none")}</option>
            {filteredChapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameHi}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <TagInput name="tags" label={t("notes.admin.form.tags")} initialTags={initial?.tags} suggestions={[...NOTE_TAGS]} />

      <FileUploadField
        kind="note-file"
        accept="application/pdf"
        label={t("notes.admin.form.pdfFile")}
        value={file}
        onChange={(f) => setFile(f)}
        required
      />
      <input type="hidden" name="fileUrl" value={file?.url ?? ""} />
      <input type="hidden" name="fileSizeBytes" value={file?.sizeBytes ?? ""} />

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPublished" defaultChecked={initial?.isPublished ?? false} />
        {t("notes.admin.form.publishNow")}
      </label>

      <Button type="submit" size="lg" disabled={!file}>
        {initial ? t("notes.admin.form.save") : t("notes.admin.form.add")}
      </Button>
    </form>
  );
}
