"use client";

import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { StepsEditor } from "@/components/admin/steps-editor";

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
  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">करियर का नाम</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} placeholder="इंजीनियरिंग" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="stream">स्ट्रीम</Label>
        <Input id="stream" name="stream" required defaultValue={initial?.stream} placeholder="Science (PCM)" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="overview">परिचय</Label>
        <Textarea id="overview" name="overview" required rows={4} defaultValue={initial?.overview} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="eligibility">पात्रता</Label>
        <Input id="eligibility" name="eligibility" defaultValue={initial?.eligibility ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exams">प्रवेश परीक्षाएँ (कॉमा से अलग करें)</Label>
        <Input id="exams" name="exams" defaultValue={initial?.exams.join(", ") ?? ""} placeholder="JEE, NEET" />
      </div>

      <StepsEditor initial={parseSteps(initial?.stepsJson)} />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="salaryRange">औसत वेतन सीमा</Label>
          <Input id="salaryRange" name="salaryRange" defaultValue={initial?.salaryRange ?? ""} placeholder="₹4-12 लाख/वर्ष" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="scholarships">छात्रवृत्ति विकल्प</Label>
          <Input id="scholarships" name="scholarships" defaultValue={initial?.scholarships ?? ""} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPublished" defaultChecked={initial?.isPublished ?? false} />
        तुरंत प्रकाशित करें
      </label>

      <Button type="submit" size="lg">
        {initial ? "बदलाव सहेजें" : "रोडमैप जोड़ें"}
      </Button>
    </form>
  );
}
