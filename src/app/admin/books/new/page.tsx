import { prisma } from "@/lib/prisma";
import { BookForm } from "@/components/admin/book-form";
import { createBook } from "../actions";

export default async function NewBookPage() {
  const subjects = await prisma.subject.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">नई पुस्तक जोड़ें</h1>
      <BookForm subjects={subjects} action={createBook} />
    </div>
  );
}
