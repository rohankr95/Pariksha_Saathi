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

  return (
    <Card className="p-5">
      <h2 className="mb-4 font-sans text-lg font-semibold text-foreground">नया अनुरोध भेजें</h2>

      {state.success && (
        <p className="mb-4 flex items-center gap-2 rounded-[var(--radius-md)] bg-success/10 p-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {state.mergedIntoExisting
            ? "यह विषय पहले से किसी अन्य विद्यार्थी द्वारा अनुरोधित है — आपकी रुचि जोड़ दी गई है!"
            : "आपका अनुरोध सफलतापूर्वक भेज दिया गया है।"}
        </p>
      )}

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="subjectId">विषय</Label>
            <Select id="subjectId" name="subjectId" required>
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
          <Label htmlFor="chapter">अध्याय / विषयवस्तु</Label>
          <Input id="chapter" name="chapter" placeholder="जैसे: त्रिकोणमिति" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="preferredTeacherId">पसंदीदा शिक्षक</Label>
            <Select id="preferredTeacherId" name="preferredTeacherId" defaultValue="">
              <option value="">कोई भी</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mode">माध्यम</Label>
            <Select id="mode" name="mode" defaultValue="ONLINE">
              <option value="ONLINE">ऑनलाइन</option>
              <option value="OFFLINE">ऑफलाइन</option>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="preferredTime">पसंदीदा समय</Label>
          <Input id="preferredTime" name="preferredTime" placeholder="जैसे: शाम 4-6 बजे" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">विवरण</Label>
          <Textarea id="description" name="description" rows={3} placeholder="किस विषय में कठिनाई हो रही है?" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="urgency">तात्कालिकता</Label>
          <Select id="urgency" name="urgency" defaultValue="normal">
            <option value="low">कम</option>
            <option value="normal">सामान्य</option>
            <option value="high">अधिक</option>
          </Select>
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-[var(--color-section-examdates)]">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "भेजा जा रहा है..." : "अनुरोध भेजें"}
        </Button>
      </form>
    </Card>
  );
}
