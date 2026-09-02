"use client";

import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CopyUploadField, type UploadedFile } from "@/components/answer-copies/copy-upload-field";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { submitAnswerCopy, type SubmitAnswerCopyState } from "@/app/answer-copies/actions";
import type { Subject } from "@prisma/client";

const initialState: SubmitAnswerCopyState = {};

export function SubmitCopyForm({
  subjects,
  teachersBySubject,
  remaining,
}: {
  subjects: Subject[];
  teachersBySubject: Record<string, { id: string; name: string }[]>;
  remaining: number;
}) {
  const [state, formAction, pending] = useActionState(submitAnswerCopy, initialState);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [fileName, setFileName] = useState<string | undefined>();

  const [wasPending, setWasPending] = useState(pending);
  if (pending !== wasPending) {
    setWasPending(pending);
    if (!pending && state.success) {
      setFile(null);
      setFileName(undefined);
    }
  }

  const teachers = teachersBySubject[subjectId] ?? [];

  if (remaining <= 0) {
    return (
      <Card className="p-5 text-sm text-muted-foreground">
        आपने इस सप्ताह की अधिकतम सीमा तक उत्तरपुस्तिकाएँ जमा कर दी हैं। कृपया अगले सप्ताह पुनः प्रयास करें।
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h2 className="mb-1 font-sans text-lg font-semibold text-foreground">उत्तरपुस्तिका जमा करें</h2>
      <p className="mb-4 text-xs text-muted-foreground">इस सप्ताह {remaining} जमा करने की सीमा शेष है</p>

      {state.success && (
        <p className="mb-4 flex items-center gap-2 rounded-[var(--radius-md)] bg-success/10 p-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> आपकी उत्तरपुस्तिका सफलतापूर्वक जमा कर दी गई है।
        </p>
      )}

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="subjectId">विषय</Label>
            <Select id="subjectId" name="subjectId" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameHi}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="classLevel">कक्षा</Label>
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
          <Label htmlFor="teacherId">शिक्षक</Label>
          <Select id="teacherId" name="teacherId" required disabled={teachers.length === 0}>
            {teachers.length === 0 ? (
              <option value="">इस विषय हेतु कोई शिक्षक उपलब्ध नहीं</option>
            ) : (
              teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))
            )}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="paperName">प्रश्नपत्र / परीक्षा का नाम</Label>
          <Input id="paperName" name="paperName" required minLength={3} maxLength={150} placeholder="जैसे: अर्धवार्षिक परीक्षा — गणित" />
        </div>

        <CopyUploadField
          kind="answer-copy"
          label="उत्तरपुस्तिका फाइल"
          value={file}
          fileName={fileName}
          onChange={(f, name) => {
            setFile(f);
            setFileName(name);
          }}
          required
        />
        <input type="hidden" name="fileUrl" value={file?.path ?? ""} />

        {state.error && (
          <p role="alert" className="text-sm text-[var(--color-section-examdates)]">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending || !file || teachers.length === 0}>
          {pending ? "जमा हो रहा है..." : "जमा करें"}
        </Button>
      </form>
    </Card>
  );
}
