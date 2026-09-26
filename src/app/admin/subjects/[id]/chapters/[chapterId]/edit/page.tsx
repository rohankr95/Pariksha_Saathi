import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ChapterForm } from "@/components/admin/chapter-form";
import { getT } from "@/lib/i18n/server";
import { updateChapter } from "../../actions";

export default async function EditChapterPage({ params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const { id, chapterId } = await params;
  const t = await getT();
  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!chapter || chapter.subjectId !== id) notFound();

  return (
    <div>
      <Link href={`/admin/subjects/${id}/chapters`} className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("admin.subjects.backToList")}
      </Link>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("admin.subjects.chapters.editTitle")}</h1>
      <ChapterForm initial={chapter} action={updateChapter.bind(null, chapterId, id)} />
    </div>
  );
}
