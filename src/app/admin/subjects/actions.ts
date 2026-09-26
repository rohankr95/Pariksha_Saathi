"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";
import { getT } from "@/lib/i18n/server";

const subjectSchema = z.object({
  nameHi: z.string().min(1).max(80),
  nameEn: z.string().min(1).max(80),
  classLevel: z.enum(["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"]),
  icon: z.string().max(20).optional(),
  colorKey: z.string().max(40).optional(),
});

export type SubjectFormState = { error?: string };

export async function createSubject(_prev: SubjectFormState, formData: FormData): Promise<SubjectFormState> {
  const t = await getT();
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);

  const parsed = subjectSchema.safeParse({
    nameHi: formData.get("nameHi"),
    nameEn: formData.get("nameEn"),
    classLevel: formData.get("classLevel"),
    icon: formData.get("icon") || undefined,
    colorKey: formData.get("colorKey") || undefined,
  });
  if (!parsed.success) return { error: t("admin.subjects.errors.invalid") };

  const maxOrder = await prisma.subject.aggregate({
    where: { classLevel: parsed.data.classLevel },
    _max: { displayOrder: true },
  });

  const subject = await prisma.subject.create({
    data: { ...parsed.data, displayOrder: (maxOrder._max.displayOrder ?? 0) + 1 },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Subject", entityId: subject.id });
  revalidatePath("/admin/subjects");
  redirect("/admin/subjects");
}

export async function updateSubject(id: string, _prev: SubjectFormState, formData: FormData): Promise<SubjectFormState> {
  const t = await getT();
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);

  const parsed = subjectSchema.safeParse({
    nameHi: formData.get("nameHi"),
    nameEn: formData.get("nameEn"),
    classLevel: formData.get("classLevel"),
    icon: formData.get("icon") || undefined,
    colorKey: formData.get("colorKey") || undefined,
  });
  if (!parsed.success) return { error: t("admin.subjects.errors.invalid") };

  await prisma.subject.update({ where: { id }, data: parsed.data });

  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Subject", entityId: id });
  revalidatePath("/admin/subjects");
  redirect("/admin/subjects");
}

export async function toggleSubjectActive(id: string, next: boolean) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.subject.update({ where: { id }, data: { isActive: next } });
  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Subject", entityId: id, meta: { isActive: next } });
  revalidatePath("/admin/subjects");
}

// The UI only ever shows the delete button when the subject has no content
// attached (see admin/subjects/page.tsx's `inUse` check) — this count check
// is pure defense-in-depth against a direct form submission bypassing that,
// so it silently no-ops rather than surfacing an error nobody will see.
export async function deleteSubject(id: string): Promise<void> {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);

  const [lectures, notes, quizzes, classRequests, answerCopies] = await Promise.all([
    prisma.lecture.count({ where: { subjectId: id } }),
    prisma.note.count({ where: { subjectId: id } }),
    prisma.quiz.count({ where: { subjectId: id } }),
    prisma.classRequest.count({ where: { subjectId: id } }),
    prisma.answerCopy.count({ where: { subjectId: id } }),
  ]);
  if (lectures + notes + quizzes + classRequests + answerCopies > 0) {
    return;
  }

  await prisma.subject.delete({ where: { id } });
  await logAudit({ userId: session.user.id, action: "DELETE", entity: "Subject", entityId: id });
  revalidatePath("/admin/subjects");
}
