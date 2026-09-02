"use client";

import { useActionState, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyUploadField, type UploadedFile } from "@/components/answer-copies/copy-upload-field";
import { ANSWER_COPY_STATUS_LABEL, ANSWER_COPY_STATUS_COLOR } from "@/lib/answer-copy-status";
import { startEvaluation, submitEvaluation, type SubmitEvaluationState } from "@/app/answer-copies/actions";
import type { AnswerCopyStatus } from "@prisma/client";

type Copy = {
  id: string;
  paperName: string;
  fileUrl: string;
  status: AnswerCopyStatus;
  submittedAt: Date;
  student: { name: string; classLevel: string | null };
  subject: { nameHi: string };
};

const initialState: SubmitEvaluationState = {};

export function TeacherQueueItem({ copy }: { copy: Copy }) {
  const [pending, startTransition] = useTransition();
  const boundAction = submitEvaluation.bind(null, copy.id);
  const [state, formAction, submitting] = useActionState(boundAction, initialState);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [fileName, setFileName] = useState<string | undefined>();

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{copy.paperName}</p>
          <p className="text-xs text-muted-foreground">
            {copy.student.name} · कक्षा {copy.student.classLevel ?? "—"} · {copy.subject.nameHi}
          </p>
          <a href={copy.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary hover:underline">
            मूल फाइल देखें
          </a>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{
            backgroundColor: `color-mix(in srgb, var(${ANSWER_COPY_STATUS_COLOR[copy.status]}) 15%, transparent)`,
            color: `var(${ANSWER_COPY_STATUS_COLOR[copy.status]})`,
          }}
        >
          {ANSWER_COPY_STATUS_LABEL[copy.status]}
        </span>
      </div>

      {copy.status !== "UNDER_EVALUATION" ? (
        <div className="mt-3 border-t border-border pt-3">
          <Button size="sm" disabled={pending} onClick={() => startTransition(() => startEvaluation(copy.id))}>
            मूल्यांकन शुरू करें
          </Button>
        </div>
      ) : (
        <form action={formAction} className="mt-3 space-y-3 border-t border-border pt-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor={`marks-${copy.id}`} className="text-xs">प्राप्त अंक</Label>
              <Input id={`marks-${copy.id}`} name="marksAwarded" type="number" min={0} step="any" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`total-${copy.id}`} className="text-xs">कुल अंक</Label>
              <Input id={`total-${copy.id}`} name="totalMarks" type="number" min={1} step="any" required />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`remarks-${copy.id}`} className="text-xs">टिप्पणी (वैकल्पिक)</Label>
            <Textarea id={`remarks-${copy.id}`} name="remarks" rows={2} maxLength={1000} />
          </div>
          <CopyUploadField
            kind="answer-copy-checked"
            label="जाँची गई फाइल (वैकल्पिक)"
            value={file}
            fileName={fileName}
            onChange={(f, name) => {
              setFile(f);
              setFileName(name);
            }}
          />
          <input type="hidden" name="checkedFileUrl" value={file?.path ?? ""} />

          {state.error && <p className="text-xs text-[var(--color-section-examdates)]">{state.error}</p>}

          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "सहेजा जा रहा है..." : "मूल्यांकन सबमिट करें"}
          </Button>
        </form>
      )}
    </Card>
  );
}
