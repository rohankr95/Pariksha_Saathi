import { FileText, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatFileSize } from "@/lib/format";
import { getT } from "@/lib/i18n/server";

type NoteCardData = {
  id: string;
  title: string;
  fileUrl: string;
  fileSizeBytes: number;
  downloads: number;
  language: string;
  tags: string[];
  subject: { nameHi: string };
  chapter: { nameHi: string } | null;
};

const LANGUAGE_KEY: Record<string, string> = {
  HINDI: "notes.language.hindi",
  ENGLISH: "notes.language.english",
  CHHATTISGARHI: "notes.language.chhattisgarhi",
};

export async function NoteCard({ note }: { note: NoteCardData }) {
  const t = await getT();
  return (
    <Card className="flex items-start gap-3 p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-notes)]/15 text-[var(--color-section-notes)]">
        <FileText className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold text-foreground">{note.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {note.subject.nameHi}
          {note.chapter ? ` · ${note.chapter.nameHi}` : ""} · {t(LANGUAGE_KEY[note.language])}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatFileSize(note.fileSizeBytes)} · {t("notes.public.downloadsCount", { count: note.downloads })}
          </span>
          <div className="flex items-center gap-3">
            <a
              href={note.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-primary hover:underline"
            >
              {t("notes.public.preview")}
            </a>
            <a
              href={`/notes/${note.id}/download`}
              className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110"
            >
              <Download className="h-3.5 w-3.5" /> {t("notes.public.download")}
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}

export type { NoteCardData };
