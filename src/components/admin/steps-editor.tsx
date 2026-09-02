"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Step = { step: string; detail: string };

export function StepsEditor({ initial }: { initial?: Step[] }) {
  const [steps, setSteps] = useState<Step[]>(
    initial && initial.length > 0 ? initial : [{ step: "", detail: "" }]
  );

  function update(i: number, field: keyof Step, value: string) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  return (
    <div className="space-y-1.5">
      <Label>चरण-दर-चरण मार्ग</Label>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-2 rounded-[var(--radius-md)] border border-border p-3">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="चरण का शीर्षक (जैसे: कक्षा 10)"
                value={s.step}
                onChange={(e) => update(i, "step", e.target.value)}
              />
              <Input
                placeholder="विवरण"
                value={s.detail}
                onChange={(e) => update(i, "detail", e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setSteps((prev) => prev.filter((_, idx) => idx !== i))}
              className="self-start rounded p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-[var(--color-section-examdates)]"
              aria-label="चरण हटाएँ"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setSteps((prev) => [...prev, { step: "", detail: "" }])}
      >
        <Plus className="h-4 w-4" /> चरण जोड़ें
      </Button>
      <input type="hidden" name="stepsJson" value={JSON.stringify(steps.filter((s) => s.step && s.detail))} />
    </div>
  );
}
