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

const examSchema = z.object({
  name: z.string().min(3).max(200),
  body: z.string().min(2).max(150),
  category: z.string().min(2).max(100),
  applyStart: dateField,
  applyEnd: dateField,
  examDate: dateField,
  resultDate: dateField,
  officialUrl: z.string().optional(),
  notificationUrl: z.string().optional(),
  classes: z.array(z.enum(["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"])).min(1),
});

function parseForm(formData: FormData) {
  return examSchema.parse({
    name: formData.get("name"),
    body: formData.get("body"),
    category: formData.get("category"),
    applyStart: formData.get("applyStart") || undefined,
    applyEnd: formData.get("applyEnd") || undefined,
    examDate: formData.get("examDate") || undefined,
    resultDate: formData.get("resultDate") || undefined,
    officialUrl: formData.get("officialUrl") || undefined,
    notificationUrl: formData.get("notificationUrl") || undefined,
    classes: formData.getAll("classes").map(String),
  });
}

export async function createExam(formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  const exam = await prisma.exam.create({
    data: { ...data, isPublished: formData.get("isPublished") === "on" },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Exam", entityId: exam.id });
  revalidatePath("/admin/exam-dates");
  revalidatePath("/exam-dates");
  redirect("/admin/exam-dates");
}

export async function updateExam(id: string, formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  await prisma.exam.update({
    where: { id },
    data: { ...data, isPublished: formData.get("isPublished") === "on" },
  });

  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Exam", entityId: id });
  revalidatePath("/admin/exam-dates");
  revalidatePath("/exam-dates");
  redirect("/admin/exam-dates");
}

export async function deleteExam(id: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.exam.delete({ where: { id } });
  await logAudit({ userId: session.user.id, action: "DELETE", entity: "Exam", entityId: id });
  revalidatePath("/admin/exam-dates");
  revalidatePath("/exam-dates");
}

export async function toggleExamPublish(id: string, next: boolean) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.exam.update({ where: { id }, data: { isPublished: next } });
  await logAudit({
    userId: session.user.id,
    action: next ? "PUBLISH" : "UNPUBLISH",
    entity: "Exam",
    entityId: id,
  });
  revalidatePath("/admin/exam-dates");
  revalidatePath("/exam-dates");
}
