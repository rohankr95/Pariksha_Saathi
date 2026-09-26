import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSubjectById } from "@/lib/queries/admin-subjects";
import { SubjectForm } from "@/components/admin/subject-form";
import { getT } from "@/lib/i18n/server";
import { updateSubject } from "../../actions";

export default async function EditSubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const subject = await getSubjectById(id);
  if (!subject) notFound();

  return (
    <div>
      <Link href="/admin/subjects" className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("admin.subjects.backToList")}
      </Link>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("admin.subjects.editTitle")}</h1>
      <SubjectForm initial={subject} action={updateSubject.bind(null, id)} />
    </div>
  );
}
