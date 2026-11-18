"use client";

import { useState, useTransition } from "react";
import { KeyRound, Copy, Check, X, Mail, AlertTriangle } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-provider";
import { resetStudentPassword } from "@/app/admin/students/actions";

export function ResetStudentPasswordButton({ studentId, studentName }: { studentId: string; studentName: string }) {
  const { t } = useLocale();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ password: string; emailed: boolean } | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  function onClick() {
    if (!window.confirm(t("admin.students.reset.confirm", { name: studentName }))) return;
    setError(false);
    startTransition(async () => {
      const r = await resetStudentPassword(studentId);
      if (r.password) setResult({ password: r.password, emailed: !!r.emailed });
      else setError(true);
    });
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the password is visible to read manually */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-label={t("admin.students.reset.action")}
        title={t("admin.students.reset.action")}
        className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-muted hover:text-primary disabled:opacity-50"
      >
        <KeyRound className="h-4 w-4" />
        <span className="hidden sm:inline">{t("admin.students.reset.action")}</span>
      </button>

      {error && <p className="mt-1 text-xs text-[var(--color-section-examdates)]">{t("admin.students.reset.error")}</p>}

      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-black/50" aria-label={t("admin.students.reset.close")} onClick={() => setResult(null)} />
          <div className="relative w-full max-w-sm rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card-hover)]">
            <button
              onClick={() => setResult(null)}
              aria-label={t("admin.students.reset.close")}
              className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-surface-muted"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-sans text-lg font-bold text-foreground">{t("admin.students.reset.title")}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{t("admin.students.reset.forStudent", { name: studentName })}</p>

            <div className="mt-4 flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border bg-surface-muted px-3 py-2.5">
              <code className="select-all font-mono text-lg font-semibold tracking-wide text-foreground">{result.password}</code>
              <button
                onClick={copy}
                className="inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-sm)] border border-border px-2 py-1 text-xs font-medium hover:bg-surface"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? t("admin.students.reset.copied") : t("admin.students.reset.copy")}
              </button>
            </div>

            <p
              className={`mt-3 flex items-start gap-1.5 text-xs ${
                result.emailed ? "text-muted-foreground" : "text-[var(--color-section-leaderboard)]"
              }`}
            >
              {result.emailed ? (
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              {result.emailed ? t("admin.students.reset.emailedNote") : t("admin.students.reset.noEmailNote")}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{t("admin.students.reset.instruction")}</p>
          </div>
        </div>
      )}
    </>
  );
}
