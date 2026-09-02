import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookForm } from "@/components/admin/book-form";
import { getT } from "@/lib/i18n/server";
import { updateBook } from "../../actions";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book, subjects] = await Promise.all([
    prisma.book.findUnique({ where: { id } }),
    prisma.subject.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);
  if (!book) notFound();
  const t = await getT();

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("books.admin.editTitle")}</h1>
      <BookForm subjects={subjects} initial={book} action={updateBook.bind(null, id)} />
    </div>
  );
}
