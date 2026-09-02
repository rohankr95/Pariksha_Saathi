"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/admin/tag-input";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { LECTURE_SPECIAL_TAGS } from "@/lib/lecture-tags";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { ClassLevel, Chapter, Subject } from "@prisma/client";

type LectureFormValues = {
  id?: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  subjectId: string;
  chapterId: string | null;
  classLevel: ClassLevel;
  language: string;
  durationSec: number | null;
  tags: string[];
  isPublished: boolean;
};

export function LectureForm({
  subjects,
  chapters,
  initial,
  action,
}: {
  subjects: Subject[];
  chapters: Chapter[];
  initial?: LectureFormValues;
  action: (formData: FormData) => Promise<void>;
}) {
  const { t } = useLocale();
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? subjects[0]?.id ?? "");
  const filteredChapters = chapters.filter((c) => c.subjectId === subjectId);

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">{t("lectures.admin.form.title")}</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">{t("lectures.admin.form.description")}</Label>
        <Textarea id="description" name="description" defaultValue={initial?.description ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="youtubeUrl">{t("lectures.admin.form.youtubeUrl")}</Label>
        <Input
          id="youtubeUrl"
          name="youtubeUrl"
          type="url"
          required
          placeholder="https://www.youtube.com/watch?v=..."
          defaultValue={initial?.youtubeUrl}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="classLevel">{t("lectures.admin.form.classLevel")}</Label>
          <Select id="classLevel" name="classLevel" defaultValue={initial?.classLevel ?? "CLASS_10"}>
            {Object.entries(CLASS_LEVEL_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="language">{t("lectures.admin.form.language")}</Label>
          <Select id="language" name="language" defaultValue={initial?.language ?? "HINDI"}>
            <option value="HINDI">{t("lectures.language.hindi")}</option>
            <option value="ENGLISH">{t("lectures.language.english")}</option>
            <option value="CHHATTISGARHI">{t("lectures.language.chhattisgarhi")}</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subjectId">{t("lectures.admin.form.subject")}</Label>
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
          <Label htmlFor="chapterId">{t("lectures.admin.form.chapter")}</Label>
          <Select id="chapterId" name="chapterId" defaultValue={initial?.chapterId ?? ""}>
            <option value="">{t("lectures.admin.form.none")}</option>
            {filteredChapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameHi}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="durationSec">{t("lectures.admin.form.duration")}</Label>
        <Input
          id="durationSec"
          name="durationSec"
          type="number"
          min={0}
          defaultValue={initial?.durationSec ?? undefined}
        />
      </div>

      <TagInput
        name="tags"
        label={t("lectures.admin.form.tags")}
        initialTags={initial?.tags}
        suggestions={[...LECTURE_SPECIAL_TAGS]}
      />

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPublished" defaultChecked={initial?.isPublished ?? false} />
        {t("lectures.admin.form.publishNow")}
      </label>

      <Button type="submit" size="lg">
        {initial ? t("lectures.admin.form.save") : t("lectures.admin.form.add")}
      </Button>
    </form>
  );
}
