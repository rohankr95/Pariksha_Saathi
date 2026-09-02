"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileUploadField, type UploadedFile } from "@/components/admin/file-upload-field";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { BOOK_CATEGORY_LABEL } from "@/lib/book-categories";
import type { BookCategory, ClassLevel, Subject } from "@prisma/client";

type BookFormValues = {
  title: string;
  category: BookCategory;
  classLevel: ClassLevel;
  subjectId: string | null;
  board: string | null;
  medium: string;
  edition: string | null;
  coverUrl: string | null;
  fileUrl: string | null;
  fileSizeBytes: number | null;
  sourceUrl: string | null;
  copyrightCleared: boolean;
  isPublished: boolean;
};

export function BookForm({
  subjects,
  initial,
  action,
}: {
  subjects: Subject[];
  initial?: BookFormValues;
  action: (formData: FormData) => Promise<void>;
}) {
  const [cover, setCover] = useState<UploadedFile | null>(
    initial?.coverUrl ? { path: initial.coverUrl, url: initial.coverUrl, sizeBytes: 0 } : null
  );
  const [file, setFile] = useState<UploadedFile | null>(
    initial?.fileUrl
      ? { path: initial.fileUrl, url: initial.fileUrl, sizeBytes: initial.fileSizeBytes ?? 0 }
      : null
  );

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">शीर्षक</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="category">श्रेणी</Label>
          <Select id="category" name="category" defaultValue={initial?.category ?? "NCERT"}>
            {Object.entries(BOOK_CATEGORY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="classLevel">कक्षा</Label>
          <Select id="classLevel" name="classLevel" defaultValue={initial?.classLevel ?? "CLASS_10"}>
            {Object.entries(CLASS_LEVEL_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subjectId">विषय (वैकल्पिक)</Label>
          <Select id="subjectId" name="subjectId" defaultValue={initial?.subjectId ?? ""}>
            <option value="">— कोई नहीं —</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameHi}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="medium">माध्यम</Label>
          <Select id="medium" name="medium" defaultValue={initial?.medium ?? "HINDI"}>
            <option value="HINDI">हिंदी</option>
            <option value="ENGLISH">English</option>
            <option value="CHHATTISGARHI">छत्तीसगढ़ी</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="board">बोर्ड / प्रकाशक</Label>
          <Input id="board" name="board" defaultValue={initial?.board ?? ""} placeholder="CBSE/NCERT" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edition">संस्करण / वर्ष</Label>
          <Input id="edition" name="edition" defaultValue={initial?.edition ?? ""} placeholder="2024-25" />
        </div>
      </div>

      <FileUploadField
        kind="book-cover"
        accept="image/png,image/jpeg,image/webp"
        label="कवर छवि (वैकल्पिक)"
        value={cover}
        onChange={setCover}
      />
      <input type="hidden" name="coverUrl" value={cover?.url ?? ""} />

      <FileUploadField
        kind="book-file"
        accept="application/pdf"
        label="PDF अपलोड करें (या नीचे स्रोत URL दें)"
        value={file}
        onChange={setFile}
      />
      <input type="hidden" name="fileUrl" value={file?.url ?? ""} />
      <input type="hidden" name="fileSizeBytes" value={file?.sizeBytes ?? ""} />

      <div className="space-y-1.5">
        <Label htmlFor="sourceUrl">आधिकारिक स्रोत URL</Label>
        <Input
          id="sourceUrl"
          name="sourceUrl"
          type="url"
          defaultValue={initial?.sourceUrl ?? ""}
          placeholder="https://ncert.nic.in/..."
        />
        <p className="text-xs text-muted-foreground">
          PDF अपलोड न करने पर, यह पुस्तक बाहरी आधिकारिक स्रोत से लिंक होगी। कम से कम एक (फाइल या स्रोत) आवश्यक है।
        </p>
      </div>

      <label className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-section-examdates)]/30 bg-[color-mix(in_srgb,var(--color-section-examdates)_6%,transparent)] p-3 text-sm">
        <Checkbox name="copyrightCleared" required defaultChecked={initial?.copyrightCleared ?? false} className="mt-0.5" />
        <span>
          मैं पुष्टि करता/करती हूँ कि यह सामग्री खुले लाइसेंस के अंतर्गत है या प्रकाशित करने की अनुमति प्राप्त है
          <span className="text-[var(--color-section-examdates)]"> *</span>
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPublished" defaultChecked={initial?.isPublished ?? false} />
        तुरंत प्रकाशित करें
      </label>

      <Button type="submit" size="lg">
        {initial ? "बदलाव सहेजें" : "पुस्तक जोड़ें"}
      </Button>
    </form>
  );
}
