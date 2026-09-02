"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { ClassLevel, Chapter, Subject } from "@prisma/client";

type QuizFormValues = {
  title: string;
  subjectId: string;
  chapterId: string | null;
  classLevel: ClassLevel;
  difficulty: string;
  timeLimitMin: number;
  marksPerQ: number;
  negativeMarks: number;
  maxAttempts: number;
  startAt: Date | null;
  endAt: Date | null;
  isPublished: boolean;
};

function toDateTimeInputValue(d: Date | null) {
  if (!d) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function QuizForm({
  subjects,
  chapters,
  initial,
  action,
}: {
  subjects: Subject[];
  chapters: Chapter[];
  initial?: QuizFormValues;
  action: (formData: FormData) => Promise<void>;
}) {
  const { t } = useLocale();
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? subjects[0]?.id ?? "");
  const filteredChapters = chapters.filter((c) => c.subjectId === subjectId);

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">{t("quiz.admin.form.title")}</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="classLevel">{t("quiz.admin.form.class")}</Label>
          <Select id="classLevel" name="classLevel" defaultValue={initial?.classLevel ?? "CLASS_10"}>
            {Object.entries(CLASS_LEVEL_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="difficulty">{t("quiz.admin.form.difficulty")}</Label>
          <Select id="difficulty" name="difficulty" defaultValue={initial?.difficulty ?? "MEDIUM"}>
            <option value="EASY">{t("quiz.difficulty.EASY")}</option>
            <option value="MEDIUM">{t("quiz.difficulty.MEDIUM")}</option>
            <option value="HARD">{t("quiz.difficulty.HARD")}</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subjectId">{t("quiz.admin.form.subject")}</Label>
          <Select id="subjectId" name="subjectId" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameHi}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="chapterId">{t("quiz.admin.form.chapter")}</Label>
          <Select id="chapterId" name="chapterId" defaultValue={initial?.chapterId ?? ""}>
            <option value="">{t("quiz.admin.form.noneOption")}</option>
            {filteredChapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameHi}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="timeLimitMin">{t("quiz.admin.form.timeLimit")}</Label>
          <Input id="timeLimitMin" name="timeLimitMin" type="number" min={1} required defaultValue={initial?.timeLimitMin ?? 20} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="marksPerQ">{t("quiz.admin.form.marksPerQ")}</Label>
          <Input id="marksPerQ" name="marksPerQ" type="number" step="0.25" min={0.25} required defaultValue={initial?.marksPerQ ?? 1} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="negativeMarks">{t("quiz.admin.form.negativeMarks")}</Label>
          <Input id="negativeMarks" name="negativeMarks" type="number" step="0.25" min={0} required defaultValue={initial?.negativeMarks ?? 0} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="maxAttempts">{t("quiz.admin.form.maxAttempts")}</Label>
          <Input id="maxAttempts" name="maxAttempts" type="number" min={1} required defaultValue={initial?.maxAttempts ?? 3} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="startAt">{t("quiz.admin.form.startAt")}</Label>
          <Input id="startAt" name="startAt" type="datetime-local" defaultValue={toDateTimeInputValue(initial?.startAt ?? null)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endAt">{t("quiz.admin.form.endAt")}</Label>
          <Input id="endAt" name="endAt" type="datetime-local" defaultValue={toDateTimeInputValue(initial?.endAt ?? null)} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPublished" defaultChecked={initial?.isPublished ?? false} />
        {t("quiz.admin.form.publishLabel")}
      </label>

      <Button type="submit" size="lg">
        {initial ? t("quiz.admin.form.saveChanges") : t("quiz.admin.form.createAndAddQuestions")}
      </Button>
    </form>
  );
}
