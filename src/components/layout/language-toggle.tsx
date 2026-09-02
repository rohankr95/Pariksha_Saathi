"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    setLocale(locale === "hi" ? "en" : "hi");
    // Server Components already rendered on the server (data-fetching pages,
    // admin CRUD, etc.) read the locale cookie directly — they need a fresh
    // RSC fetch to pick up the new value, since only client state updates otherwise.
    startTransition(() => router.refresh());
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={pending}
      aria-label="Switch language / भाषा बदलें"
      className="gap-1.5"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Languages className="h-4 w-4" aria-hidden="true" />}
      {t("common.language")}
    </Button>
  );
}
