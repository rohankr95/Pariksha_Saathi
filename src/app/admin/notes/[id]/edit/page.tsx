import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NoteForm } from "@/components/admin/note-form";
import { updateNote } from "../../actions";

export default async function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [note, subjects, chapters] = await Promise.all([
    prisma.note.findUnique({ where: { id } }),
    prisma.subject.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.chapter.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);
  if (!note) notFound();

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">नोट संपादित करें</h1>
      <NoteForm subjects={subjects} chapters={chapters} initial={note} action={updateNote.bind(null, id)} />
    </div>
  );
}
