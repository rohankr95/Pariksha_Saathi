"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { reportBrokenLink } from "@/app/lectures/actions";

export function ReportBrokenLinkButton({ lectureId }: { lectureId: string }) {
  const [state, setState] = useState<"idle" | "open" | "sent">("idle");
  const [note, setNote] = useState("");

  if (state === "sent") {
    return <span className="text-sm text-success">धन्यवाद, रिपोर्ट भेज दी गई ✓</span>;
  }

  if (state === "open") {
    return (
      <form
        className="flex items-center gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await reportBrokenLink(lectureId, note);
          setState("sent");
        }}
      >
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="समस्या बताएं (वैकल्पिक)"
          className="h-8 rounded-[var(--radius-sm)] border border-border px-2 text-sm"
        />
        <button type="submit" className="text-sm font-medium text-primary hover:underline">
          भेजें
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setState("open")}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--color-section-examdates)]"
    >
      <Flag className="h-4 w-4" /> लिंक टूटा हुआ है?
    </button>
  );
}
