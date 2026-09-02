"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileCheck2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type UploadedFile = { path: string; url: string; sizeBytes: number };

export function FileUploadField({
  kind,
  accept,
  label,
  value,
  fileName,
  onChange,
  required,
}: {
  kind:
    | "note-file"
    | "book-file"
    | "book-cover"
    | "story-photo"
    | "exam-notification"
    | "olympiad-syllabus"
    | "question-image";
  accept: string;
  label: string;
  value: UploadedFile | null;
  fileName?: string;
  onChange: (file: UploadedFile | null, name?: string) => void;
  required?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("kind", kind);
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "अपलोड विफल");
      onChange({ path: data.path, url: data.url, sizeBytes: data.sizeBytes }, file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "अपलोड विफल");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-[var(--color-section-examdates)]">*</span>}
      </label>

      {value ? (
        <div className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border bg-surface-muted px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <FileCheck2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            <span className="truncate">{fileName || value.path.split("/").pop()}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {(value.sizeBytes / 1024).toFixed(0)} KB
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="हटाएँ"
            className="rounded-full p-1 hover:bg-border"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed border-border px-3 py-4 text-sm text-muted-foreground hover:border-primary hover:text-primary",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> अपलोड हो रहा है...
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4" /> फाइल चुनें
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="text-xs text-[var(--color-section-examdates)]">{error}</p>}
    </div>
  );
}
