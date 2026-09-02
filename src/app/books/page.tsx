import { Library } from "lucide-react";
import { getBooks } from "@/lib/queries/books";
import { getSubjects } from "@/lib/queries/curriculum";
import { BookFilterBar } from "@/components/books/book-filter-bar";
import { BookCard } from "@/components/books/book-card";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminPagination } from "@/components/admin/pagination";
import type { BookCategory, ClassLevel, Language } from "@prisma/client";

export const metadata = { title: "पुस्तकें | परीक्षा साथी" };

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filters = {
    category: sp.category as BookCategory | undefined,
    classLevel: sp.classLevel as ClassLevel | undefined,
    subjectId: sp.subjectId,
    medium: sp.medium as Language | undefined,
    q: sp.q,
    page: sp.page ? Number(sp.page) : 1,
  };

  const [{ items, page, totalPages }, subjects] = await Promise.all([
    getBooks(filters),
    getSubjects(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-books)]/15 text-[var(--color-section-books)]">
          <Library className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground sm:text-3xl">पुस्तकें</h1>
          <p className="text-sm text-muted-foreground">NCERT और संदर्भ पुस्तकों का पुस्तकालय</p>
        </div>
      </div>

      <BookFilterBar subjects={subjects} current={filters} />

      {items.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
          <AdminPagination page={page} totalPages={totalPages} basePath="/books" searchParams={sp} />
        </>
      ) : (
        <div className="mt-6">
          <EmptyState icon={Library} title="कोई पुस्तक नहीं मिली" description="फ़िल्टर बदलकर पुनः प्रयास करें।" />
        </div>
      )}
    </div>
  );
}
