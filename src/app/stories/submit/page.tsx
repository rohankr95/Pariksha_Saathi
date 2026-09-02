import Link from "next/link";
import { LogIn } from "lucide-react";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubmitStoryForm } from "@/components/stories/submit-story-form";
import { getT } from "@/lib/i18n/server";

export default async function SubmitStoryPage() {
  const session = await auth();
  const t = await getT();

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <LogIn className="h-8 w-8 text-primary" aria-hidden="true" />
          <p className="font-semibold text-foreground">{t("stories.public.loginRequired.title")}</p>
          <p className="text-sm text-muted-foreground">
            {t("stories.public.loginRequired.desc")}
          </p>
          <Button asChild>
            <Link href="/login?callbackUrl=/stories/submit">{t("stories.public.loginRequired.cta")}</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return <SubmitStoryForm />;
}
