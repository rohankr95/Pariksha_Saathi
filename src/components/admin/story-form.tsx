"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/admin/tag-input";
import { FileUploadField, type UploadedFile } from "@/components/admin/file-upload-field";
import { STORY_TAGS } from "@/lib/story-tags";

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
  const [photo, setPhoto] = useState<UploadedFile | null>(
    initial?.photoUrl ? { path: initial.photoUrl, url: initial.photoUrl, sizeBytes: 0 } : null
  );

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">शीर्षक</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="personName">व्यक्ति का नाम</Label>
          <Input id="personName" name="personName" required defaultValue={initial?.personName} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="designation">पद / उपलब्धि</Label>
          <Input id="designation" name="designation" defaultValue={initial?.designation ?? ""} placeholder="IAS, 2021 बैच" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="district">जिला</Label>
          <Input id="district" name="district" defaultValue={initial?.district ?? "सूरजपुर"} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="block">विकासखंड</Label>
          <Input id="block" name="block" defaultValue={initial?.block ?? ""} />
        </div>
      </div>

      <FileUploadField
        kind="story-photo"
        accept="image/png,image/jpeg,image/webp"
        label="फोटो"
        value={photo}
        onChange={setPhoto}
      />
      <input type="hidden" name="photoUrl" value={photo?.url ?? ""} />

      <div className="space-y-1.5">
        <Label htmlFor="videoUrl">YouTube लिंक (वैकल्पिक)</Label>
        <Input id="videoUrl" name="videoUrl" type="url" defaultValue={initial?.videoUrl ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">कहानी (लेख)</Label>
        <Textarea id="body" name="body" rows={8} defaultValue={initial?.body ?? ""} />
      </div>

      <TagInput name="tags" label="टैग" initialTags={initial?.tags} suggestions={[...STORY_TAGS]} />

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isFeatured" defaultChecked={initial?.isFeatured ?? false} />
        होम पेज पर विशेष रूप से दिखाएँ
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPublished" defaultChecked={initial?.isPublished ?? false} />
        तुरंत प्रकाशित करें
      </label>

      <Button type="submit" size="lg">
        {initial ? "बदलाव सहेजें" : "कहानी जोड़ें"}
      </Button>
    </form>
  );
}
