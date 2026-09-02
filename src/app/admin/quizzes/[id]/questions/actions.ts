"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";
import { getT } from "@/lib/i18n/server";

const baseSchema = z.object({
  type: z.enum(["MCQ_SINGLE", "MCQ_MULTIPLE", "TRUE_FALSE", "ASSERTION_REASON", "NUMERIC"]),
  textHi: z.string().min(3).max(1000),
  textEn: z.string().max(1000).optional(),
  imageUrl: z.string().optional(),
  explanation: z.string().max(2000).optional(),
  marks: z.coerce.number().min(0.25).max(20),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
});

async function buildQuestionData(formData: FormData) {
  const t = await getT();
  const base = baseSchema.parse({
    type: formData.get("type"),
    textHi: formData.get("textHi"),
    textEn: formData.get("textEn") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    explanation: formData.get("explanation") || undefined,
    marks: formData.get("marks"),
    difficulty: formData.get("difficulty"),
  });

  let optionsJson: string[] | null = null;
  let correctAnswer: unknown;

  if (base.type === "MCQ_SINGLE" || base.type === "ASSERTION_REASON") {
    const options = formData.getAll("options").map(String).filter((o) => o.trim().length > 0);
    if (options.length < 2) throw new Error(t("quiz.admin.validation.minTwoOptions"));
    const correctIndex = Number(formData.get("correctIndex"));
    if (Number.isNaN(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
      throw new Error(t("quiz.admin.validation.selectCorrectOption"));
    }
    optionsJson = options;
    correctAnswer = correctIndex;
  } else if (base.type === "MCQ_MULTIPLE") {
    const options = formData.getAll("options").map(String).filter((o) => o.trim().length > 0);
    if (options.length < 2) throw new Error(t("quiz.admin.validation.minTwoOptions"));
    const correctIndices = formData.getAll("correctIndices").map(Number);
    if (correctIndices.length === 0) throw new Error(t("quiz.admin.validation.selectAtLeastOneCorrect"));
    optionsJson = options;
    correctAnswer = correctIndices;
  } else if (base.type === "TRUE_FALSE") {
    optionsJson = ["सही", "गलत"];
    correctAnswer = formData.get("correctBool") === "true";
  } else if (base.type === "NUMERIC") {
    const val = Number(formData.get("correctNumeric"));
    if (Number.isNaN(val)) throw new Error(t("quiz.admin.validation.enterValidNumber"));
    optionsJson = null;
    correctAnswer = val;
  }

  return {
    ...base,
    optionsJson: optionsJson ?? undefined,
    correctAnswer: correctAnswer as Prisma.InputJsonValue,
  };
}

export async function createQuestion(quizId: string, formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = await buildQuestionData(formData);

  const maxOrder = await prisma.question.aggregate({ where: { quizId }, _max: { displayOrder: true } });

  const question = await prisma.question.create({
    data: { ...data, quizId, displayOrder: (maxOrder._max.displayOrder ?? 0) + 1 },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Question", entityId: question.id });
  revalidatePath(`/admin/quizzes/${quizId}/questions`);
  redirect(`/admin/quizzes/${quizId}/questions`);
}

export async function updateQuestion(questionId: string, quizId: string, formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = await buildQuestionData(formData);

  await prisma.question.update({ where: { id: questionId }, data });

  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Question", entityId: questionId });
  revalidatePath(`/admin/quizzes/${quizId}/questions`);
  redirect(`/admin/quizzes/${quizId}/questions`);
}

export async function deleteQuestion(questionId: string, quizId: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.question.delete({ where: { id: questionId } });
  await logAudit({ userId: session.user.id, action: "DELETE", entity: "Question", entityId: questionId });
  revalidatePath(`/admin/quizzes/${quizId}/questions`);
}

export async function moveQuestionOrder(questionId: string, quizId: string, direction: "up" | "down") {
  await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const current = await prisma.question.findUnique({ where: { id: questionId } });
  if (!current) return;

  const neighbor = await prisma.question.findFirst({
    where: {
      quizId,
      displayOrder: direction === "up" ? { lt: current.displayOrder } : { gt: current.displayOrder },
    },
    orderBy: { displayOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;

  await prisma.$transaction([
    prisma.question.update({ where: { id: current.id }, data: { displayOrder: neighbor.displayOrder } }),
    prisma.question.update({ where: { id: neighbor.id }, data: { displayOrder: current.displayOrder } }),
  ]);
  revalidatePath(`/admin/quizzes/${quizId}/questions`);
}
