import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExamForm } from "@/components/admin/exam-form";
import { getT } from "@/lib/i18n/server";
import { updateExam } from "../../actions";

export default async function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) notFound();

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("examDates.admin.editTitle")}</h1>
      <ExamForm initial={exam} action={updateExam.bind(null, id)} />
    </div>
  );
}
