"use client";

import { useActionState } from "react";
import { CheckCircle2, PenLine } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitStory, type SubmitStoryState } from "@/app/stories/submit/actions";
import { useLocale } from "@/lib/i18n/locale-provider";

const initialState: SubmitStoryState = {};

export function SubmitStoryForm() {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState(submitStory, initialState);

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-stories)]/15 text-[var(--color-section-stories)]">
          <PenLine className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground">{t("stories.public.submit.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("stories.public.submit.subtitle")}
          </p>
        </div>
      </div>

      {state.success ? (
        <Card className="flex items-center gap-3 p-5">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
          <p className="text-sm">
            {t("stories.public.submit.successMessage")}
          </p>
        </Card>
      ) : (
        <Card className="p-5 sm:p-6">
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">{t("stories.public.submit.titleLabel")}</Label>
              <Input id="title" name="title" required minLength={3} placeholder={t("stories.public.submit.titlePlaceholder")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">{t("stories.public.submit.bodyLabel")}</Label>
              <Textarea
                id="body"
                name="body"
                required
                minLength={20}
                rows={8}
                placeholder={t("stories.public.submit.bodyPlaceholder")}
              />
            </div>
            {state.error && (
              <p role="alert" className="text-sm text-[var(--color-section-examdates)]">
                {state.error}
              </p>
            )}
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? t("stories.public.submit.submitting") : t("stories.public.submit.submitCta")}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
