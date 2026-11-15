"use client";

import { useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";
import { submitFeedback, type FeedbackState } from "@/app/feedback/actions";

const initialState: FeedbackState = {};
const CATEGORIES = ["SUGGESTION", "PROBLEM", "CONTENT", "OTHER"] as const;

export function FeedbackForm() {
  const [state, formAction, pending] = useActionState(submitFeedback, initialState);
  const { t } = useLocale();

  if (state.success) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-foreground">{t("feedback.public.success")}</p>
        <Button asChild variant="outline" className="mt-4">
          <a href="/feedback">{t("feedback.public.sendAnother")}</a>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Honeypot: hidden from people, tempting to bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        defaultValue=""
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("feedback.public.name")}</Label>
          <Input id="name" name="name" maxLength={100} autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">{t("feedback.public.category")}</Label>
          <Select id="category" name="category" defaultValue="SUGGESTION">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`feedback.public.categories.${c}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">{t("feedback.public.email")}</Label>
        <Input id="email" name="email" type="email" maxLength={150} autoComplete="email" />
        <p className="text-xs text-muted-foreground">{t("feedback.public.emailHint")}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">{t("feedback.public.message")}</Label>
        <Textarea
          id="message"
          name="message"
          required
          minLength={5}
          maxLength={2000}
          rows={5}
          placeholder={t("feedback.public.messagePlaceholder")}
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-[var(--color-section-examdates)]">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        <Send className="h-4 w-4" aria-hidden="true" />
        {pending ? t("feedback.public.submitting") : t("feedback.public.submit")}
      </Button>
    </form>
  );
}
