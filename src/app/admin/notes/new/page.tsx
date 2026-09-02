import { prisma } from "@/lib/prisma";
import { NoteForm } from "@/components/admin/note-form";
import { createNote } from "../actions";

export default async function NewNotePage() {
  const [subjects, chapters] = await Promise.all([
    prisma.subject.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.chapter.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">नया नोट जोड़ें</h1>
      <NoteForm subjects={subjects} chapters={chapters} action={createNote} />
    </div>
  );
}
