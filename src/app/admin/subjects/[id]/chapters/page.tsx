import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus, ArrowLeft, ListTree } from "lucide-react";
import { getSubjectWithChapters } from "@/lib/queries/admin-subjects";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { getT } from "@/lib/i18n/server";
import { deleteChapter, moveChapterOrder } from "./actions";

export default async function SubjectChaptersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const subject = await getSubjectWithChapters(id);
  if (!subject) notFound();

  return (
    <div>
      <Link href="/admin/subjects" className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("admin.subjects.backToList")}
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground">{subject.nameHi}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.subjects.chapters.countLabel", { count: subject.chapters.length })}</p>
        </div>
        <Link
          href={`/admin/subjects/${id}/chapters/new`}
          className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] bg-primary px-3.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> {t("admin.subjects.chapters.addNew")}
        </Link>
      </div>

      {subject.chapters.length === 0 ? (
        <EmptyState icon={ListTree} title={t("admin.subjects.chapters.emptyTitle")} description={t("admin.subjects.chapters.emptyDesc")} />
      ) : (
        <div className="space-y-3">
          {subject.chapters.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border p-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{c.nameHi}</p>
                {c.nameEn && <p className="text-xs text-muted-foreground">{c.nameEn}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <form action={moveChapterOrder.bind(null, c.id, id, "up")}>
                  <button type="submit" className="rounded p-1 hover:bg-surface-muted" aria-label={t("admin.subjects.chapters.moveUp")}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                </form>
                <form action={moveChapterOrder.bind(null, c.id, id, "down")}>
                  <button type="submit" className="rounded p-1 hover:bg-surface-muted" aria-label={t("admin.subjects.chapters.moveDown")}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </form>
                <Link
                  href={`/admin/subjects/${id}/chapters/${c.id}/edit`}
                  className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                  aria-label={t("admin.subjects.edit")}
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <form action={deleteChapter.bind(null, c.id, id)}>
                  <ConfirmSubmitButton confirmMessage={t("admin.subjects.chapters.deleteConfirm")} aria-label={t("admin.subjects.delete")}>
                    <Trash2 className="h-4 w-4" />
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
