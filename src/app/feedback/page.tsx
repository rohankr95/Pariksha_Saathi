import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("feedback.meta.title") };
}

export default async function FeedbackPage() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-sans text-2xl font-bold text-foreground">{t("feedback.public.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("feedback.public.subtitle")}</p>
      <Card className="mt-6 p-6">
        <FeedbackForm />
      </Card>
    </div>
  );
}
