import { prisma } from "@/lib/prisma";
import { NoteForm } from "@/components/admin/note-form";
import { getT } from "@/lib/i18n/server";
import { createNote } from "../actions";

export default async function NewNotePage() {
  const [subjects, chapters] = await Promise.all([
    prisma.subject.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.chapter.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);
  const t = await getT();

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("notes.admin.newTitle")}</h1>
      <NoteForm subjects={subjects} chapters={chapters} action={createNote} />
    </div>
  );
}
