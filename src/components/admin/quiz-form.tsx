"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
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
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? subjects[0]?.id ?? "");
  const filteredChapters = chapters.filter((c) => c.subjectId === subjectId);

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">प्रश्नोत्तरी शीर्षक</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="classLevel">कक्षा</Label>
          <Select id="classLevel" name="classLevel" defaultValue={initial?.classLevel ?? "CLASS_10"}>
            {Object.entries(CLASS_LEVEL_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="difficulty">कठिनाई</Label>
          <Select id="difficulty" name="difficulty" defaultValue={initial?.difficulty ?? "MEDIUM"}>
            <option value="EASY">आसान</option>
            <option value="MEDIUM">मध्यम</option>
            <option value="HARD">कठिन</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subjectId">विषय</Label>
          <Select id="subjectId" name="subjectId" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameHi}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="chapterId">अध्याय</Label>
          <Select id="chapterId" name="chapterId" defaultValue={initial?.chapterId ?? ""}>
            <option value="">— कोई नहीं —</option>
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
          <Label htmlFor="timeLimitMin">समय सीमा (मिनट)</Label>
          <Input id="timeLimitMin" name="timeLimitMin" type="number" min={1} required defaultValue={initial?.timeLimitMin ?? 20} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="marksPerQ">प्रति प्रश्न अंक</Label>
          <Input id="marksPerQ" name="marksPerQ" type="number" step="0.25" min={0.25} required defaultValue={initial?.marksPerQ ?? 1} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="negativeMarks">नकारात्मक अंकन</Label>
          <Input id="negativeMarks" name="negativeMarks" type="number" step="0.25" min={0} required defaultValue={initial?.negativeMarks ?? 0} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="maxAttempts">अधिकतम प्रयास</Label>
          <Input id="maxAttempts" name="maxAttempts" type="number" min={1} required defaultValue={initial?.maxAttempts ?? 3} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="startAt">उपलब्ध से (वैकल्पिक)</Label>
          <Input id="startAt" name="startAt" type="datetime-local" defaultValue={toDateTimeInputValue(initial?.startAt ?? null)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endAt">उपलब्ध तक (वैकल्पिक)</Label>
          <Input id="endAt" name="endAt" type="datetime-local" defaultValue={toDateTimeInputValue(initial?.endAt ?? null)} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPublished" defaultChecked={initial?.isPublished ?? false} />
        प्रकाशित करें (प्रश्न जोड़ने के बाद ही प्रकाशित होगी)
      </label>

      <Button type="submit" size="lg">
        {initial ? "बदलाव सहेजें" : "प्रश्नोत्तरी बनाएँ और प्रश्न जोड़ें"}
      </Button>
    </form>
  );
}
