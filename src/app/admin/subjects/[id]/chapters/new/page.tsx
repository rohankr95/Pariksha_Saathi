import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSubjectById } from "@/lib/queries/admin-subjects";
import { ChapterForm } from "@/components/admin/chapter-form";
import { getT } from "@/lib/i18n/server";
import { createChapter } from "../actions";

export default async function NewChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const subject = await getSubjectById(id);
  if (!subject) notFound();

  return (
    <div>
      <Link href={`/admin/subjects/${id}/chapters`} className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {subject.nameHi}
      </Link>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("admin.subjects.chapters.addNew")}</h1>
      <ChapterForm action={createChapter.bind(null, id)} />
    </div>
  );
}
