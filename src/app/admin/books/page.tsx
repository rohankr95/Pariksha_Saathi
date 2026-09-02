import Link from "next/link";
import { Pencil, Trash2, Library } from "lucide-react";
import { getAdminBooks } from "@/lib/queries/admin-books";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { BOOK_CATEGORY_LABEL } from "@/lib/book-categories";
import { toggleBookPublish, deleteBook } from "./actions";

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, totalPages } = await getAdminBooks({ q: sp.q, page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">पुस्तकें</h1>
        <p className="text-sm text-muted-foreground">कुल {total} पुस्तकें</p>
      </div>

      <AdminListToolbar
        searchPlaceholder="पुस्तकें खोजें..."
        defaultSearch={sp.q}
        addHref="/admin/books/new"
        addLabel="नई पुस्तक"
      />

      {items.length === 0 ? (
        <EmptyState icon={Library} title="कोई पुस्तक नहीं मिली" description="नई पुस्तक जोड़ें।" />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">शीर्षक</th>
                <th className="p-3">श्रेणी</th>
                <th className="p-3">कॉपीराइट</th>
                <th className="p-3">स्थिति</th>
                <th className="p-3 text-right">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((book) => (
                <tr key={book.id}>
                  <td className="max-w-xs p-3 font-medium">{book.title}</td>
                  <td className="p-3">
                    <Badge variant="outline">{BOOK_CATEGORY_LABEL[book.category]}</Badge>
                  </td>
                  <td className="p-3">
                    {book.copyrightCleared ? (
                      <Badge variant="success">स्पष्ट</Badge>
                    ) : (
                      <Badge variant="accent">जाँच लंबित</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <PublishToggle
                      isPublished={book.isPublished}
                      action={toggleBookPublish.bind(null, book.id, !book.isPublished)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/books/${book.id}/edit`}
                        className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                        aria-label="संपादित करें"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteBook.bind(null, book.id)}>
                        <ConfirmSubmitButton confirmMessage="क्या आप वाकई इस पुस्तक को हटाना चाहते हैं?" aria-label="हटाएँ">
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

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/books" searchParams={sp} />
    </div>
  );
}
