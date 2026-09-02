import { notFound } from "next/navigation";
import { TeacherForm } from "@/components/admin/teacher-form";
import { getTeacherById } from "@/lib/queries/admin-teachers";
import { getSubjects } from "@/lib/queries/curriculum";
import { getT } from "@/lib/i18n/server";
import { updateTeacher } from "../../actions";

export default async function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const [teacher, subjects] = await Promise.all([getTeacherById(id), getSubjects()]);
  if (!teacher) notFound();

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("admin.teachers.editTitle")}</h1>
      <TeacherForm
        subjects={subjects}
        initial={{
          name: teacher.name,
          email: teacher.email,
          mobile: teacher.mobile,
          subjectIds: teacher.subjects.map((s) => s.id),
        }}
        action={updateTeacher.bind(null, id)}
      />
    </div>
  );
}
