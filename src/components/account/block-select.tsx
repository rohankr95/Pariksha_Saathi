"use client";

import { Select } from "@/components/ui/select";
import { BLOCKS } from "@/lib/blocks";
import { useLocale } from "@/lib/i18n/locale-provider";

export function BlockSelect({
  id = "block",
  name = "block",
  defaultValue,
  required,
}: {
  id?: string;
  name?: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  const { t, locale } = useLocale();
  const known = BLOCKS.some((b) => b.value === defaultValue);
  return (
    <Select id={id} name={name} required={required} defaultValue={known ? (defaultValue as string) : ""}>
      <option value="" disabled>
        {t("auth.blockPlaceholder")}
      </option>
      {BLOCKS.map((b) => (
        <option key={b.value} value={b.value}>
          {locale === "en" ? b.en : b.value}
        </option>
      ))}
    </Select>
  );
}
