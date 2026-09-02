import Link from "next/link";
import { ArrowUp, ArrowDown, Pencil, Trash2, BookOpen } from "lucide-react";
import { getAdminNotes } from "@/lib/queries/admin-notes";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatFileSize } from "@/lib/format";
import { toggleNotePublish, deleteNote, moveNoteOrder } from "./actions";

export default async function AdminNotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, totalPages } = await getAdminNotes({ q: sp.q, page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">नोट्स</h1>
        <p className="text-sm text-muted-foreground">कुल {total} नोट्स</p>
      </div>

      <AdminListToolbar
        searchPlaceholder="नोट्स खोजें..."
        defaultSearch={sp.q}
        addHref="/admin/notes/new"
        addLabel="नया नोट"
      />

      {items.length === 0 ? (
        <EmptyState icon={BookOpen} title="कोई नोट्स नहीं मिले" description="नया नोट जोड़ें।" />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">शीर्षक</th>
                <th className="p-3">विषय</th>
                <th className="p-3">आकार / डाउनलोड</th>
                <th className="p-3">स्थिति</th>
                <th className="p-3">क्रम</th>
                <th className="p-3 text-right">कार्रवाई</th>
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
                    {formatFileSize(note.fileSizeBytes)} · {note.downloads} डाउनलोड
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
                        <button type="submit" className="rounded p-1 hover:bg-surface-muted" aria-label="ऊपर ले जाएँ">
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                      </form>
                      <form action={moveNoteOrder.bind(null, note.id, "down")}>
                        <button type="submit" className="rounded p-1 hover:bg-surface-muted" aria-label="नीचे ले जाएँ">
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
                        aria-label="संपादित करें"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteNote.bind(null, note.id)}>
                        <ConfirmSubmitButton confirmMessage="क्या आप वाकई इस नोट को हटाना चाहते हैं?" aria-label="हटाएँ">
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
