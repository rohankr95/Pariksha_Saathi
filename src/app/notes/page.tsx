import { BookOpen, Flame } from "lucide-react";
import { getNotes, getMostDownloadedNotes } from "@/lib/queries/notes";
import { getSubjects, getChapters } from "@/lib/queries/curriculum";
import { ContentFilterBar } from "@/components/shared/content-filter-bar";
import { NoteCard } from "@/components/notes/note-card";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminPagination } from "@/components/admin/pagination";
import { NOTE_TAGS } from "@/lib/note-tags";
import { formatFileSize } from "@/lib/format";
import { getT } from "@/lib/i18n/server";
import type { ClassLevel, Language } from "@prisma/client";

export const metadata = { title: "नोट्स | परीक्षा साथी" };

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const t = await getT();
  const filters = {
    classLevel: sp.classLevel as ClassLevel | undefined,
    subjectId: sp.subjectId,
    chapterId: sp.chapterId,
    language: sp.language as Language | undefined,
    tag: sp.tag,
    q: sp.q,
    page: sp.page ? Number(sp.page) : 1,
  };

  const [{ items, page, totalPages }, subjects, chapters, mostDownloaded] = await Promise.all([
    getNotes(filters),
    getSubjects(filters.classLevel),
    getChapters(filters.subjectId),
    getMostDownloadedNotes(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-notes)]/15 text-[var(--color-section-notes)]">
          <BookOpen className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground sm:text-3xl">{t("notes.public.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("notes.public.subtitle")}</p>
        </div>
      </div>

      {mostDownloaded.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Flame className="h-4 w-4 text-[var(--color-section-stories)]" /> {t("notes.public.mostDownloaded")}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {mostDownloaded.map((note) => (
              <a
                key={note.id}
                href={`/notes/${note.id}/download`}
                className="flex w-56 shrink-0 flex-col gap-1 rounded-[var(--radius-md)] border border-border bg-surface p-3 hover:shadow-[var(--shadow-card-hover)]"
              >
                <span className="line-clamp-2 text-xs font-semibold text-foreground">{note.title}</span>
                <span className="text-[11px] text-muted-foreground">
                  {note.subject.nameHi} · {formatFileSize(note.fileSizeBytes)} ·{" "}
                  {t("notes.public.downloadsCount", { count: note.downloads })}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      <ContentFilterBar
        action="/notes"
        subjects={subjects}
        chapters={chapters}
        tags={NOTE_TAGS}
        searchPlaceholder={t("notes.public.searchPlaceholder")}
        current={filters}
      />

      {items.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
          <AdminPagination page={page} totalPages={totalPages} basePath="/notes" searchParams={sp} />
        </>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={BookOpen}
            title={t("notes.public.empty.title")}
            description={t("notes.public.empty.description")}
          />
        </div>
      )}
    </div>
  );
}
