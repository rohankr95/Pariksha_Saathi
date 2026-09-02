"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileUploadField, type UploadedFile } from "@/components/admin/file-upload-field";

type QuestionType = "MCQ_SINGLE" | "MCQ_MULTIPLE" | "TRUE_FALSE" | "ASSERTION_REASON" | "NUMERIC";

type QuestionFormValues = {
  type: QuestionType;
  textHi: string;
  textEn: string | null;
  imageUrl: string | null;
  optionsJson: unknown;
  correctAnswer: unknown;
  explanation: string | null;
  marks: number;
  difficulty: string;
};

const TYPE_LABEL: Record<QuestionType, string> = {
  MCQ_SINGLE: "एकल सही उत्तर (MCQ)",
  MCQ_MULTIPLE: "बहु सही उत्तर (MCQ)",
  TRUE_FALSE: "सही / गलत",
  ASSERTION_REASON: "अभिकथन-कारण",
  NUMERIC: "संख्यात्मक उत्तर",
};

function parseOptions(json: unknown): string[] {
  return Array.isArray(json) ? json.map(String) : [];
}

export function QuestionForm({
  initial,
  action,
}: {
  initial?: QuestionFormValues;
  action: (formData: FormData) => Promise<void>;
}) {
  const [type, setType] = useState<QuestionType>(initial?.type ?? "MCQ_SINGLE");
  const [options, setOptions] = useState<string[]>(
    initial ? (parseOptions(initial.optionsJson).length > 0 ? parseOptions(initial.optionsJson) : ["", ""]) : ["", ""]
  );
  const [correctIndex, setCorrectIndex] = useState<number>(
    initial && (initial.type === "MCQ_SINGLE" || initial.type === "ASSERTION_REASON")
      ? Number(initial.correctAnswer)
      : 0
  );
  const [correctIndices, setCorrectIndices] = useState<Set<number>>(
    initial && initial.type === "MCQ_MULTIPLE" && Array.isArray(initial.correctAnswer)
      ? new Set((initial.correctAnswer as number[]).map(Number))
      : new Set()
  );
  const [correctBool, setCorrectBool] = useState(
    initial && initial.type === "TRUE_FALSE" ? Boolean(initial.correctAnswer) : true
  );
  const [image, setImage] = useState<UploadedFile | null>(
    initial?.imageUrl ? { path: initial.imageUrl, url: initial.imageUrl, sizeBytes: 0 } : null
  );

  const needsOptions = type === "MCQ_SINGLE" || type === "MCQ_MULTIPLE" || type === "ASSERTION_REASON";

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="type">प्रकार</Label>
        <Select id="type" name="type" value={type} onChange={(e) => setType(e.target.value as QuestionType)}>
          {Object.entries(TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="textHi">प्रश्न (हिंदी)</Label>
        <Textarea id="textHi" name="textHi" required rows={3} defaultValue={initial?.textHi} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="textEn">प्रश्न (English, वैकल्पिक)</Label>
        <Textarea id="textEn" name="textEn" rows={2} defaultValue={initial?.textEn ?? ""} />
      </div>

      <FileUploadField
        kind="question-image"
        accept="image/png,image/jpeg,image/webp"
        label="चित्र (वैकल्पिक)"
        value={image}
        onChange={setImage}
      />
      <input type="hidden" name="imageUrl" value={image?.url ?? ""} />

      {needsOptions && (
        <div className="space-y-1.5">
          <Label>विकल्प — सही उत्तर को चिह्नित करें</Label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                {type === "MCQ_MULTIPLE" ? (
                  <input
                    type="checkbox"
                    name="correctIndices"
                    value={i}
                    checked={correctIndices.has(i)}
                    onChange={(e) => {
                      const next = new Set(correctIndices);
                      if (e.target.checked) next.add(i);
                      else next.delete(i);
                      setCorrectIndices(next);
                    }}
                    className="h-5 w-5 shrink-0"
                  />
                ) : (
                  <input
                    type="radio"
                    name="correctIndex"
                    value={i}
                    checked={correctIndex === i}
                    onChange={() => setCorrectIndex(i)}
                    className="h-5 w-5 shrink-0"
                  />
                )}
                <Input
                  name="options"
                  required
                  value={opt}
                  onChange={(e) => setOptions((prev) => prev.map((o, idx) => (idx === i ? e.target.value : o)))}
                  placeholder={`विकल्प ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))}
                  className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-[var(--color-section-examdates)]"
                  aria-label="विकल्प हटाएँ"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setOptions((prev) => [...prev, ""])}>
            <Plus className="h-4 w-4" /> विकल्प जोड़ें
          </Button>
        </div>
      )}

      {type === "TRUE_FALSE" && (
        <div className="space-y-1.5">
          <Label>सही उत्तर</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="correctBool"
                value="true"
                checked={correctBool}
                onChange={() => setCorrectBool(true)}
              />
              सही
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="correctBool"
                value="false"
                checked={!correctBool}
                onChange={() => setCorrectBool(false)}
              />
              गलत
            </label>
          </div>
        </div>
      )}

      {type === "NUMERIC" && (
        <div className="space-y-1.5">
          <Label htmlFor="correctNumeric">सही संख्यात्मक उत्तर</Label>
          <Input
            id="correctNumeric"
            name="correctNumeric"
            type="number"
            step="any"
            required
            defaultValue={initial && initial.type === "NUMERIC" ? Number(initial.correctAnswer) : undefined}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="explanation">व्याख्या (वैकल्पिक)</Label>
        <Textarea id="explanation" name="explanation" rows={2} defaultValue={initial?.explanation ?? ""} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="marks">अंक</Label>
          <Input id="marks" name="marks" type="number" step="0.25" min={0.25} required defaultValue={initial?.marks ?? 1} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="difficulty">कठिनाई</Label>
          <Select id="difficulty" name="difficulty" defaultValue={initial?.difficulty ?? "MEDIUM"}>
            <option value="EASY">आसान</option>
            <option value="MEDIUM">मध्यम</option>
            <option value="HARD">कठिन</option>
          </Select>
        </div>
      </div>

      <Button type="submit" size="lg">
        {initial ? "बदलाव सहेजें" : "प्रश्न जोड़ें"}
      </Button>
    </form>
  );
}
