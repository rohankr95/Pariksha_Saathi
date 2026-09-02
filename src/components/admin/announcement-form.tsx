"use client";

import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";

type AnnouncementFormValues = {
  textHi: string;
  textEn: string | null;
  link: string | null;
  expiresAt: Date | null;
  isActive: boolean;
};

function toDateInputValue(d: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function AnnouncementForm({
  initial,
  action,
}: {
  initial?: AnnouncementFormValues;
  action: (formData: FormData) => Promise<void>;
}) {
  const { t } = useLocale();

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="textHi">{t("admin.announcements.form.textHi")}</Label>
        <Textarea id="textHi" name="textHi" required rows={2} defaultValue={initial?.textHi} maxLength={300} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="textEn">{t("admin.announcements.form.textEn")}</Label>
        <Textarea id="textEn" name="textEn" rows={2} defaultValue={initial?.textEn ?? ""} maxLength={300} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="link">{t("admin.announcements.form.link")}</Label>
        <Input id="link" name="link" type="url" defaultValue={initial?.link ?? ""} placeholder="https://..." />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="expiresAt">{t("admin.announcements.form.expiresAt")}</Label>
        <Input id="expiresAt" name="expiresAt" type="date" defaultValue={toDateInputValue(initial?.expiresAt ?? null)} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isActive" defaultChecked={initial?.isActive ?? true} />
        {t("admin.announcements.form.activeNow")}
      </label>

      <Button type="submit" size="lg">
        {initial ? t("admin.announcements.form.save") : t("admin.announcements.form.add")}
      </Button>
    </form>
  );
}
