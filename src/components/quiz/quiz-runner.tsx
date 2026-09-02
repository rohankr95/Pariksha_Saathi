"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Clock, Flag, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { saveAnswer, toggleMarkForReview, recordTabSwitch, submitAttempt } from "@/app/quiz/actions";
import type { ClientQuestion } from "@/lib/quiz-types";
import type { StudentAnswer } from "@/lib/quiz-scoring";
import { shuffledIndexToOriginal } from "@/lib/build-client-questions";
import { useLocale } from "@/lib/i18n/locale-provider";

type Props = {
  attemptId: string;
  title: string;
  timeLimitMin: number;
  startedAtISO: string;
  questions: ClientQuestion[];
  optionOrder: Record<string, number[]>;
  initialAnswers: Record<string, StudentAnswer>;
  initialMarked: string[];
};

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function QuizRunner({
  attemptId,
  title,
  timeLimitMin,
  startedAtISO,
  questions,
  optionOrder,
  initialAnswers,
  initialMarked,
}: Props) {
  const { t } = useLocale();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>(initialAnswers);
  const [marked, setMarked] = useState<Set<string>>(new Set(initialMarked));
  const [submitting, startSubmit] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const submittedRef = useRef(false);

  const deadline = useMemo(
    () => new Date(startedAtISO).getTime() + timeLimitMin * 60 * 1000,
    [startedAtISO, timeLimitMin]
  );
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.round((deadline - Date.now()) / 1000)));

  const doSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    startSubmit(async () => {
      await submitAttempt(attemptId);
    });
  }, [attemptId]);

  useEffect(() => {
    const timer = setInterval(() => {
      const secs = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0) {
        clearInterval(timer);
        doSubmit();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline, doSubmit]);

  useEffect(() => {
    function onVisibility() {
      if (document.hidden) recordTabSwitch(attemptId);
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [attemptId]);

  const question = questions[index];
  const total = questions.length;

  function statusFor(qid: string): "answered" | "marked" | "unanswered" {
    if (marked.has(qid)) return "marked";
    const a = answers[qid];
    if (a === undefined || a === null || (Array.isArray(a) && a.length === 0)) return "unanswered";
    return "answered";
  }

  function persistAnswer(qid: string, value: StudentAnswer) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
    saveAnswer(attemptId, qid, value);
  }

  function toggleMark(qid: string) {
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
    toggleMarkForReview(attemptId, qid);
  }

  function selectSingle(originalOrShuffledIndex: number) {
    const orig = shuffledIndexToOriginal(optionOrder[question.id], originalOrShuffledIndex);
    if (question.type === "TRUE_FALSE") {
      persistAnswer(question.id, orig === 0);
    } else {
      persistAnswer(question.id, orig);
    }
  }

  function toggleMulti(shuffledIndex: number) {
    const orig = shuffledIndexToOriginal(optionOrder[question.id], shuffledIndex);
    const current = Array.isArray(answers[question.id]) ? [...(answers[question.id] as number[])] : [];
    const has = current.includes(orig);
    const next = has ? current.filter((v) => v !== orig) : [...current, orig];
    persistAnswer(question.id, next);
  }

  const answeredCount = questions.filter((q) => statusFor(q.id) === "answered").length;
  const markedCount = questions.filter((q) => statusFor(q.id) === "marked").length;
  const urgent = remaining <= 60;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="line-clamp-1 font-sans text-lg font-bold text-foreground">{title}</h1>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums",
            urgent ? "bg-[var(--color-section-examdates)]/15 text-[var(--color-section-examdates)]" : "bg-primary/10 text-primary"
          )}
        >
          <Clock className="h-4 w-4" /> {formatClock(remaining)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div>
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              {t("quiz.runner.questionOf", { current: index + 1, total, marks: question.marks })}
            </p>
            <p className="text-base font-medium leading-relaxed text-foreground">{question.textHi}</p>
            {question.textEn && <p className="mt-1 text-sm text-muted-foreground">{question.textEn}</p>}

            {question.imageUrl && (
              <div className="relative mt-3 h-48 w-full max-w-sm overflow-hidden rounded-[var(--radius-md)] bg-surface-muted">
                <Image src={question.imageUrl} alt="" fill className="object-contain" unoptimized />
              </div>
            )}

            <div className="mt-5 space-y-2.5">
              {(question.type === "MCQ_SINGLE" || question.type === "ASSERTION_REASON" || question.type === "TRUE_FALSE") &&
                question.options?.map((opt, i) => {
                  const orig = shuffledIndexToOriginal(optionOrder[question.id], i);
                  const isSelected =
                    question.type === "TRUE_FALSE"
                      ? answers[question.id] === (orig === 0)
                      : answers[question.id] === orig;
                  return (
                    <button
                      key={i}
                      onClick={() => selectSingle(i)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[var(--radius-md)] border p-3 text-left text-sm",
                        isSelected
                          ? "border-primary bg-primary/5 font-medium text-primary"
                          : "border-border hover:bg-surface-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px]",
                          isSelected ? "border-primary bg-primary text-white" : "border-border"
                        )}
                      >
                        {isSelected && "✓"}
                      </span>
                      {opt}
                    </button>
                  );
                })}

              {question.type === "MCQ_MULTIPLE" &&
                question.options?.map((opt, i) => {
                  const orig = shuffledIndexToOriginal(optionOrder[question.id], i);
                  const currentAns = Array.isArray(answers[question.id]) ? (answers[question.id] as number[]) : [];
                  const isSelected = currentAns.includes(orig);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleMulti(i)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[var(--radius-md)] border p-3 text-left text-sm",
                        isSelected
                          ? "border-primary bg-primary/5 font-medium text-primary"
                          : "border-border hover:bg-surface-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-[10px]",
                          isSelected ? "border-primary bg-primary text-white" : "border-border"
                        )}
                      >
                        {isSelected && "✓"}
                      </span>
                      {opt}
                    </button>
                  );
                })}

              {question.type === "NUMERIC" && (
                <Input
                  type="number"
                  step="any"
                  value={typeof answers[question.id] === "number" ? String(answers[question.id]) : ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? null : Number(e.target.value);
                    persistAnswer(question.id, val);
                  }}
                  placeholder={t("quiz.runner.typeYourAnswer")}
                  className="max-w-xs"
                />
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <button
                onClick={() => toggleMark(question.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
                  marked.has(question.id) ? "bg-[var(--color-section-quiz)]/15 text-[var(--color-section-quiz)]" : "border border-border text-muted-foreground"
                )}
              >
                <Flag className="h-3.5 w-3.5" /> {t("quiz.runner.markForReview")}
              </button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
                  <ChevronLeft className="h-4 w-4" /> {t("quiz.runner.prev")}
                </Button>
                {index < total - 1 ? (
                  <Button size="sm" onClick={() => setIndex((i) => i + 1)}>
                    {t("quiz.runner.next")} <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="sm" variant="accent" onClick={() => setConfirmOpen(true)}>
                    {t("quiz.runner.submit")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <p className="mb-3 text-xs font-semibold text-muted-foreground">{t("quiz.runner.palette")}</p>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, i) => {
                const status = statusFor(q.id);
                return (
                  <button
                    key={q.id}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-xs font-semibold",
                      i === index && "ring-2 ring-primary ring-offset-1",
                      status === "answered" && "bg-success/20 text-success",
                      status === "marked" && "bg-[var(--color-section-quiz)]/20 text-[var(--color-section-quiz)]",
                      status === "unanswered" && "bg-surface-muted text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <p>{t("quiz.runner.answered", { count: answeredCount })}</p>
              <p>{t("quiz.runner.marked", { count: markedCount })}</p>
              <p>{t("quiz.runner.remaining", { count: total - answeredCount })}</p>
            </div>
          </div>

          <Button variant="accent" className="w-full" onClick={() => setConfirmOpen(true)}>
            {t("quiz.runner.submitQuiz")}
          </Button>
        </aside>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-[var(--radius-lg)] bg-surface p-5 shadow-xl">
            <p className="font-semibold text-foreground">{t("quiz.runner.confirmTitle")}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("quiz.runner.confirmDesc", { answered: answeredCount, total })}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)} disabled={submitting}>
                {t("quiz.runner.cancel")}
              </Button>
              <Button size="sm" onClick={doSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("quiz.runner.submit")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
