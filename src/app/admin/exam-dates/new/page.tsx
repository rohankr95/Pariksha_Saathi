import { ExamForm } from "@/components/admin/exam-form";
import { getT } from "@/lib/i18n/server";
import { createExam } from "../actions";

export default async function NewExamPage() {
  const t = await getT();
  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("examDates.admin.newTitle")}</h1>
      <ExamForm action={createExam} />
    </div>
  );
}
