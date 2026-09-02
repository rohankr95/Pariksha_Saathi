"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CAREER_QUIZ } from "@/lib/career-quiz";

export function InterestQuiz() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});

  function answer(categories: string[]) {
    const next = { ...scores };
    for (const c of categories) next[c] = (next[c] ?? 0) + 1;
    setScores(next);

    if (step + 1 < CAREER_QUIZ.length) {
      setStep(step + 1);
      return;
    }

    const top = Object.entries(next)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
    router.push(`/career?suggested=${encodeURIComponent(top.join(","))}`);
  }

  const question = CAREER_QUIZ[step];
  const progress = Math.round((step / CAREER_QUIZ.length) * 100);

  return (
    <Card className="mx-auto max-w-lg p-6">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Compass className="h-4 w-4 text-[var(--color-section-career)]" />
        प्रश्न {step + 1} / {CAREER_QUIZ.length}
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-[var(--color-section-career)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h2 className="mb-5 font-sans text-lg font-semibold text-foreground">{question.question}</h2>

      <div className="space-y-2.5">
        {question.options.map((option) => (
          <button
            key={option.label}
            onClick={() => answer(option.categories)}
            className="w-full rounded-[var(--radius-md)] border border-border p-3.5 text-left text-sm hover:border-[var(--color-section-career)] hover:bg-[var(--color-section-career)]/5"
          >
            {option.label}
          </button>
        ))}
      </div>

      {step > 0 && (
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => setStep(step - 1)}>
          पिछला प्रश्न
        </Button>
      )}
    </Card>
  );
}
