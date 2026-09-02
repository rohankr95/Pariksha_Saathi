"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLocale(locale === "hi" ? "en" : "hi")}
      aria-label="Switch language / भाषा बदलें"
      className="gap-1.5"
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      {t("common.language")}
    </Button>
  );
}
