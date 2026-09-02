import Link from "next/link";
import { Pencil, Trash2, Library } from "lucide-react";
import { getAdminBooks } from "@/lib/queries/admin-books";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getT } from "@/lib/i18n/server";
import { toggleBookPublish, deleteBook } from "./actions";

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, totalPages } = await getAdminBooks({ q: sp.q, page });
  const t = await getT();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">{t("books.admin.listTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("books.admin.totalCount", { count: total })}</p>
      </div>

      <AdminListToolbar
        searchPlaceholder={t("books.admin.searchPlaceholder")}
        defaultSearch={sp.q}
        addHref="/admin/books/new"
        addLabel={t("books.admin.addLabel")}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Library}
          title={t("books.admin.empty.title")}
          description={t("books.admin.empty.description")}
        />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">{t("books.admin.table.title")}</th>
                <th className="p-3">{t("books.admin.table.category")}</th>
                <th className="p-3">{t("books.admin.table.copyright")}</th>
                <th className="p-3">{t("books.admin.table.status")}</th>
                <th className="p-3 text-right">{t("books.admin.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((book) => (
                <tr key={book.id}>
                  <td className="max-w-xs p-3 font-medium">{book.title}</td>
                  <td className="p-3">
                    <Badge variant="outline">{t(`books.category.${book.category}`)}</Badge>
                  </td>
                  <td className="p-3">
                    {book.copyrightCleared ? (
                      <Badge variant="success">{t("books.admin.copyrightClear")}</Badge>
                    ) : (
                      <Badge variant="accent">{t("books.admin.copyrightPending")}</Badge>
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
                        aria-label={t("books.admin.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteBook.bind(null, book.id)}>
                        <ConfirmSubmitButton
                          confirmMessage={t("books.admin.deleteConfirm")}
                          aria-label={t("books.admin.delete")}
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

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/books" searchParams={sp} />
    </div>
  );
}
