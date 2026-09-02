"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/admin/tag-input";
import { FileUploadField, type UploadedFile } from "@/components/admin/file-upload-field";
import { STORY_TAGS } from "@/lib/story-tags";
import { useLocale } from "@/lib/i18n/locale-provider";

type StoryFormValues = {
  title: string;
  personName: string;
  designation: string | null;
  district: string | null;
  block: string | null;
  body: string | null;
  videoUrl: string | null;
  photoUrl: string | null;
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
};

export function StoryForm({
  initial,
  action,
}: {
  initial?: StoryFormValues;
  action: (formData: FormData) => Promise<void>;
}) {
  const { t } = useLocale();
  const [photo, setPhoto] = useState<UploadedFile | null>(
    initial?.photoUrl ? { path: initial.photoUrl, url: initial.photoUrl, sizeBytes: 0 } : null
  );

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">{t("stories.admin.form.title")}</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="personName">{t("stories.admin.form.personName")}</Label>
          <Input id="personName" name="personName" required defaultValue={initial?.personName} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="designation">{t("stories.admin.form.designation")}</Label>
          <Input id="designation" name="designation" defaultValue={initial?.designation ?? ""} placeholder={t("stories.admin.form.designationPlaceholder")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="district">{t("stories.admin.form.district")}</Label>
          <Input id="district" name="district" defaultValue={initial?.district ?? t("stories.admin.form.defaultDistrict")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="block">{t("stories.admin.form.block")}</Label>
          <Input id="block" name="block" defaultValue={initial?.block ?? ""} />
        </div>
      </div>

      <FileUploadField
        kind="story-photo"
        accept="image/png,image/jpeg,image/webp"
        label={t("stories.admin.form.photo")}
        value={photo}
        onChange={setPhoto}
      />
      <input type="hidden" name="photoUrl" value={photo?.url ?? ""} />

      <div className="space-y-1.5">
        <Label htmlFor="videoUrl">{t("stories.admin.form.videoUrl")}</Label>
        <Input id="videoUrl" name="videoUrl" type="url" defaultValue={initial?.videoUrl ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">{t("stories.admin.form.body")}</Label>
        <Textarea id="body" name="body" rows={8} defaultValue={initial?.body ?? ""} />
      </div>

      <TagInput name="tags" label={t("stories.admin.form.tags")} initialTags={initial?.tags} suggestions={[...STORY_TAGS]} />

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isFeatured" defaultChecked={initial?.isFeatured ?? false} />
        {t("stories.admin.form.showOnHome")}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPublished" defaultChecked={initial?.isPublished ?? false} />
        {t("stories.admin.form.publishNow")}
      </label>

      <Button type="submit" size="lg">
        {initial ? t("stories.admin.form.saveChanges") : t("stories.admin.form.addStory")}
      </Button>
    </form>
  );
}
