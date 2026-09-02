"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function TagInput({
  name,
  label,
  initialTags = [],
  suggestions,
}: {
  name: string;
  label: string;
  initialTags?: string[];
  suggestions?: string[];
}) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const value = raw.trim();
    if (value && !tags.includes(value)) setTags((prev) => [...prev, value]);
    setDraft("");
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {/* Hidden inputs so this posts as a normal multi-value form field */}
      {tags.map((tag) => (
        <input key={tag} type="hidden" name={name} value={tag} />
      ))}
      <div className="flex flex-wrap items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-surface p-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="outline" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
              aria-label={`${tag} हटाएँ`}
              className="rounded-full p-0.5 hover:bg-surface-muted"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(draft);
            }
          }}
          onBlur={() => draft && addTag(draft)}
          placeholder="टैग जोड़ें और Enter दबाएँ"
          className="h-8 min-w-[140px] flex-1 border-0 px-1 shadow-none focus-visible:ring-0"
        />
      </div>
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {suggestions
            .filter((s) => !tags.includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
