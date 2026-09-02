"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileUploadField, type UploadedFile } from "@/components/admin/file-upload-field";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import type { ClassLevel } from "@prisma/client";

type OlympiadFormValues = {
  name: string;
  body: string;
  eligibleClasses: ClassLevel[];
  regStart: Date | null;
  regEnd: Date | null;
  fee: string | null;
  pattern: string | null;
  officialUrl: string | null;
  syllabusUrl: string | null;
  previousPapersUrl: string | null;
  isPublished: boolean;
};

function toDateInputValue(d: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function OlympiadForm({
  initial,
  action,
}: {
  initial?: OlympiadFormValues;
  action: (formData: FormData) => Promise<void>;
}) {
  const [syllabus, setSyllabus] = useState<UploadedFile | null>(
    initial?.syllabusUrl ? { path: initial.syllabusUrl, url: initial.syllabusUrl, sizeBytes: 0 } : null
  );

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">ओलंपियाड का नाम</Label>
        <Input id="name" name="name" required defaultValue={initial?.name} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="body">आयोजक संस्था</Label>
        <Input id="body" name="body" required defaultValue={initial?.body} placeholder="SOF" />
      </div>

      <div className="space-y-1.5">
        <Label>पात्र कक्षाएँ</Label>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(CLASS_LEVEL_LABEL) as ClassLevel[]).map((c) => (
            <label key={c} className="flex items-center gap-1.5 text-sm">
              <Checkbox
                name="eligibleClasses"
                value={c}
                defaultChecked={initial?.eligibleClasses?.includes(c) ?? false}
              />
              {CLASS_LEVEL_LABEL[c]}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="regStart">पंजीकरण प्रारंभ</Label>
          <Input id="regStart" name="regStart" type="date" defaultValue={toDateInputValue(initial?.regStart ?? null)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="regEnd">पंजीकरण अंतिम तिथि</Label>
          <Input id="regEnd" name="regEnd" type="date" defaultValue={toDateInputValue(initial?.regEnd ?? null)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fee">शुल्क</Label>
          <Input id="fee" name="fee" defaultValue={initial?.fee ?? ""} placeholder="₹150" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="officialUrl">आधिकारिक वेबसाइट</Label>
          <Input id="officialUrl" name="officialUrl" type="url" defaultValue={initial?.officialUrl ?? ""} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pattern">परीक्षा पैटर्न</Label>
        <Textarea id="pattern" name="pattern" rows={3} defaultValue={initial?.pattern ?? ""} placeholder="50 MCQ, 60 मिनट" />
      </div>

      <FileUploadField
        kind="olympiad-syllabus"
        accept="application/pdf"
        label="पाठ्यक्रम PDF (वैकल्पिक)"
        value={syllabus}
        onChange={setSyllabus}
      />
      <input type="hidden" name="syllabusUrl" value={syllabus?.url ?? ""} />

      <div className="space-y-1.5">
        <Label htmlFor="previousPapersUrl">पिछले प्रश्नपत्र लिंक</Label>
        <Input id="previousPapersUrl" name="previousPapersUrl" type="url" defaultValue={initial?.previousPapersUrl ?? ""} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPublished" defaultChecked={initial?.isPublished ?? false} />
        तुरंत प्रकाशित करें
      </label>

      <Button type="submit" size="lg">
        {initial ? "बदलाव सहेजें" : "ओलंपियाड जोड़ें"}
      </Button>
    </form>
  );
}
