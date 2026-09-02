"use client";

import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { StepsEditor } from "@/components/admin/steps-editor";
import { useLocale } from "@/lib/i18n/locale-provider";

type RoadmapFormValues = {
  title: string;
  stream: string;
  overview: string;
  eligibility: string | null;
  salaryRange: string | null;
  scholarships: string | null;
  exams: string[];
  stepsJson: unknown;
  isPublished: boolean;
};

function parseSteps(json: unknown): { step: string; detail: string }[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (s): s is { step: string; detail: string } =>
      typeof s === "object" && s !== null && "step" in s && "detail" in s
  );
}

export function RoadmapForm({
  initial,
  action,
}: {
  initial?: RoadmapFormValues;
  action: (formData: FormData) => Promise<void>;
}) {
  const { t } = useLocale();

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">{t("career.form.title")}</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} placeholder={t("career.form.titlePlaceholder")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="stream">{t("career.form.stream")}</Label>
        <Input id="stream" name="stream" required defaultValue={initial?.stream} placeholder="Science (PCM)" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="overview">{t("career.form.overview")}</Label>
        <Textarea id="overview" name="overview" required rows={4} defaultValue={initial?.overview} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="eligibility">{t("career.form.eligibility")}</Label>
        <Input id="eligibility" name="eligibility" defaultValue={initial?.eligibility ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exams">{t("career.form.exams")}</Label>
        <Input id="exams" name="exams" defaultValue={initial?.exams.join(", ") ?? ""} placeholder="JEE, NEET" />
      </div>

      <StepsEditor initial={parseSteps(initial?.stepsJson)} />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="salaryRange">{t("career.form.salaryRange")}</Label>
          <Input id="salaryRange" name="salaryRange" defaultValue={initial?.salaryRange ?? ""} placeholder="₹4-12 लाख/वर्ष" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="scholarships">{t("career.form.scholarships")}</Label>
          <Input id="scholarships" name="scholarships" defaultValue={initial?.scholarships ?? ""} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPublished" defaultChecked={initial?.isPublished ?? false} />
        {t("career.form.publishNow")}
      </label>

      <Button type="submit" size="lg">
        {initial ? t("career.form.save") : t("career.form.add")}
      </Button>
    </form>
  );
}
