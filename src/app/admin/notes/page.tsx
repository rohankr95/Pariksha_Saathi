import Link from "next/link";
import { ArrowUp, ArrowDown, Pencil, Trash2, BookOpen } from "lucide-react";
import { getAdminNotes } from "@/lib/queries/admin-notes";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatFileSize } from "@/lib/format";
import { getT } from "@/lib/i18n/server";
import { toggleNotePublish, deleteNote, moveNoteOrder } from "./actions";

export default async function AdminNotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, totalPages } = await getAdminNotes({ q: sp.q, page });
  const t = await getT();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">{t("notes.admin.listTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("notes.admin.totalCount", { count: total })}</p>
      </div>

      <AdminListToolbar
        searchPlaceholder={t("notes.admin.searchPlaceholder")}
        defaultSearch={sp.q}
        addHref="/admin/notes/new"
        addLabel={t("notes.admin.addLabel")}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t("notes.admin.empty.title")}
          description={t("notes.admin.empty.description")}
        />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">{t("notes.admin.table.title")}</th>
                <th className="p-3">{t("notes.admin.table.subject")}</th>
                <th className="p-3">{t("notes.admin.table.sizeDownloads")}</th>
                <th className="p-3">{t("notes.admin.table.status")}</th>
                <th className="p-3">{t("notes.admin.table.order")}</th>
                <th className="p-3 text-right">{t("notes.admin.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((note) => (
                <tr key={note.id}>
                  <td className="max-w-xs p-3 font-medium">{note.title}</td>
                  <td className="p-3 text-muted-foreground">
                    {note.subject.nameHi}
                    {note.chapter && <><br /><span className="text-xs">{note.chapter.nameHi}</span></>}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {formatFileSize(note.fileSizeBytes)} · {t("notes.public.downloadsCount", { count: note.downloads })}
                  </td>
                  <td className="p-3">
                    <PublishToggle
                      isPublished={note.isPublished}
                      action={toggleNotePublish.bind(null, note.id, !note.isPublished)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <form action={moveNoteOrder.bind(null, note.id, "up")}>
                        <button type="submit" className="rounded p-1 hover:bg-surface-muted" aria-label={t("notes.admin.moveUp")}>
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                      </form>
                      <form action={moveNoteOrder.bind(null, note.id, "down")}>
                        <button type="submit" className="rounded p-1 hover:bg-surface-muted" aria-label={t("notes.admin.moveDown")}>
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/notes/${note.id}/edit`}
                        className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                        aria-label={t("notes.admin.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteNote.bind(null, note.id)}>
                        <ConfirmSubmitButton
                          confirmMessage={t("notes.admin.deleteConfirm")}
                          aria-label={t("notes.admin.delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/notes" searchParams={sp} />
    </div>
  );
}
