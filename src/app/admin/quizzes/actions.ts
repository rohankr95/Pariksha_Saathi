"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";

const dateField = z
  .string()
  .optional()
  .transform((v) => (v ? new Date(v) : undefined));

const quizSchema = z.object({
  title: z.string().min(3).max(200),
  subjectId: z.string().min(1),
  chapterId: z.string().optional(),
  classLevel: z.enum(["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  timeLimitMin: z.coerce.number().int().min(1).max(240),
  marksPerQ: z.coerce.number().min(0.25).max(20),
  negativeMarks: z.coerce.number().min(0).max(20),
  maxAttempts: z.coerce.number().int().min(1).max(20),
  startAt: dateField,
  endAt: dateField,
});

function parseForm(formData: FormData) {
  return quizSchema.parse({
    title: formData.get("title"),
    subjectId: formData.get("subjectId"),
    chapterId: formData.get("chapterId") || undefined,
    classLevel: formData.get("classLevel"),
    difficulty: formData.get("difficulty"),
    timeLimitMin: formData.get("timeLimitMin"),
    marksPerQ: formData.get("marksPerQ"),
    negativeMarks: formData.get("negativeMarks"),
    maxAttempts: formData.get("maxAttempts"),
    startAt: formData.get("startAt") || undefined,
    endAt: formData.get("endAt") || undefined,
  });
}

export async function createQuiz(formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  const quiz = await prisma.quiz.create({
    data: {
      ...data,
      chapterId: data.chapterId || null,
      isPublished: formData.get("isPublished") === "on",
      createdById: session.user.id,
    },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Quiz", entityId: quiz.id });
  revalidatePath("/admin/quizzes");
  redirect(`/admin/quizzes/${quiz.id}/questions`);
}

export async function updateQuiz(id: string, formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  await prisma.quiz.update({
    where: { id },
    data: { ...data, chapterId: data.chapterId || null, isPublished: formData.get("isPublished") === "on" },
  });

  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Quiz", entityId: id });
  revalidatePath("/admin/quizzes");
  revalidatePath("/quiz");
  redirect("/admin/quizzes");
}

export async function deleteQuiz(id: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.quiz.delete({ where: { id } });
  await logAudit({ userId: session.user.id, action: "DELETE", entity: "Quiz", entityId: id });
  revalidatePath("/admin/quizzes");
  revalidatePath("/quiz");
}

export async function toggleQuizPublish(id: string, next: boolean) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  if (next) {
    const count = await prisma.question.count({ where: { quizId: id } });
    if (count === 0) return; // never publish an empty quiz
  }
  await prisma.quiz.update({ where: { id }, data: { isPublished: next } });
  await logAudit({
    userId: session.user.id,
    action: next ? "PUBLISH" : "UNPUBLISH",
    entity: "Quiz",
    entityId: id,
  });
  revalidatePath("/admin/quizzes");
  revalidatePath("/quiz");
}
