import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SubjectForm } from "@/components/admin/subject-form";
import { getT } from "@/lib/i18n/server";
import { createSubject } from "../actions";

export default async function NewSubjectPage() {
  const t = await getT();
  return (
    <div>
      <Link href="/admin/subjects" className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("admin.subjects.backToList")}
      </Link>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("admin.subjects.addNew")}</h1>
      <SubjectForm action={createSubject} />
    </div>
  );
}
