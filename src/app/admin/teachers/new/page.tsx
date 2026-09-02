import { TeacherForm } from "@/components/admin/teacher-form";
import { getSubjects } from "@/lib/queries/curriculum";
import { getT } from "@/lib/i18n/server";
import { createTeacher } from "../actions";

export default async function NewTeacherPage() {
  const t = await getT();
  const subjects = await getSubjects();
  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("admin.teachers.newTitle")}</h1>
      <TeacherForm subjects={subjects} action={createTeacher} />
    </div>
  );
}
