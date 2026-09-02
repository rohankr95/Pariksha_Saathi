"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { submitClassRequest, type SubmitClassRequestState } from "@/app/class-request/actions";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { Subject } from "@prisma/client";

const initialState: SubmitClassRequestState = {};

export function ClassRequestForm({
  subjects,
  teachers,
}: {
  subjects: Subject[];
  teachers: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(submitClassRequest, initialState);
  const { t } = useLocale();

  return (
    <Card className="p-5">
      <h2 className="mb-4 font-sans text-lg font-semibold text-foreground">{t("classRequest.form.heading")}</h2>

      {state.success && (
        <p className="mb-4 flex items-center gap-2 rounded-[var(--radius-md)] bg-success/10 p-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {state.mergedIntoExisting ? t("classRequest.form.mergedSuccess") : t("classRequest.form.success")}
        </p>
      )}

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="subjectId">{t("classRequest.form.subject")}</Label>
            <Select id="subjectId" name="subjectId" required>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameHi}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="classLevel">{t("classRequest.form.classLevel")}</Label>
            <Select id="classLevel" name="classLevel" defaultValue="CLASS_10">
              {Object.entries(CLASS_LEVEL_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="chapter">{t("classRequest.form.chapter")}</Label>
          <Input id="chapter" name="chapter" placeholder={t("classRequest.form.chapterPlaceholder")} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="preferredTeacherId">{t("classRequest.form.preferredTeacher")}</Label>
            <Select id="preferredTeacherId" name="preferredTeacherId" defaultValue="">
              <option value="">{t("classRequest.form.anyTeacherOption")}</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mode">{t("classRequest.form.mode")}</Label>
            <Select id="mode" name="mode" defaultValue="ONLINE">
              <option value="ONLINE">{t("classRequest.form.online")}</option>
              <option value="OFFLINE">{t("classRequest.form.offline")}</option>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="preferredTime">{t("classRequest.form.preferredTime")}</Label>
          <Input id="preferredTime" name="preferredTime" placeholder={t("classRequest.form.preferredTimePlaceholder")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">{t("classRequest.form.description")}</Label>
          <Textarea id="description" name="description" rows={3} placeholder={t("classRequest.form.descriptionPlaceholder")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="urgency">{t("classRequest.form.urgency")}</Label>
          <Select id="urgency" name="urgency" defaultValue="normal">
            <option value="low">{t("classRequest.form.urgencyLow")}</option>
            <option value="normal">{t("classRequest.form.urgencyNormal")}</option>
            <option value="high">{t("classRequest.form.urgencyHigh")}</option>
          </Select>
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-[var(--color-section-examdates)]">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("classRequest.form.submitting") : t("classRequest.form.submit")}
        </Button>
      </form>
    </Card>
  );
}
