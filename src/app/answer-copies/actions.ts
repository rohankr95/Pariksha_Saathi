"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";
import { sendEmail, renderNotification } from "@/lib/email";
import { countRecentSubmissions } from "@/lib/queries/answer-copies";
import { ANSWER_COPY_WEEKLY_LIMIT } from "@/lib/answer-copy-status";

const submitSchema = z.object({
  subjectId: z.string().min(1),
  teacherId: z.string().min(1),
  classLevel: z.enum(["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"]),
  paperName: z.string().min(3).max(150),
  fileUrl: z.string().min(1),
});

export type SubmitAnswerCopyState = { error?: string; success?: boolean };

export async function submitAnswerCopy(_prev: SubmitAnswerCopyState, formData: FormData): Promise<SubmitAnswerCopyState> {
  const session = await requireUser();
  if (session.user.role !== "STUDENT") return { error: "केवल विद्यार्थी उत्तरपुस्तिका जमा कर सकते हैं" };

  const parsed = submitSchema.safeParse({
    subjectId: formData.get("subjectId"),
    teacherId: formData.get("teacherId"),
    classLevel: formData.get("classLevel"),
    paperName: formData.get("paperName"),
    fileUrl: formData.get("fileUrl"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "अमान्य जानकारी" };
  const data = parsed.data;

  const recentCount = await countRecentSubmissions(session.user.id);
  if (recentCount >= ANSWER_COPY_WEEKLY_LIMIT) {
    return { error: `आप एक सप्ताह में अधिकतम ${ANSWER_COPY_WEEKLY_LIMIT} उत्तरपुस्तिकाएँ जमा कर सकते हैं` };
  }

  await prisma.answerCopy.create({
    data: {
      studentId: session.user.id,
      teacherId: data.teacherId,
      subjectId: data.subjectId,
      classLevel: data.classLevel,
      paperName: data.paperName,
      fileUrl: data.fileUrl,
      status: "SUBMITTED",
    },
  });

  const [student, teacher] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.user.findUnique({ where: { id: data.teacherId } }),
  ]);
  if (teacher?.email) {
    const { html, text } = renderNotification(
      `<p>नमस्ते ${teacher.name},</p><p>${student?.name} ने "${data.paperName}" जाँच हेतु जमा की है।</p>`,
      `${student?.name} ने "${data.paperName}" जाँच हेतु जमा की है।`
    );
    await sendEmail({ to: teacher.email, subject: "परीक्षा साथी: नई उत्तरपुस्तिका जमा हुई", html, text });
  }

  revalidatePath("/answer-copies");
  revalidatePath("/admin/answer-copies");
  return { success: true };
}

export async function startEvaluation(copyId: string) {
  const session = await requireUser();
  const copy = await prisma.answerCopy.findUnique({ where: { id: copyId } });
  if (!copy || copy.teacherId !== session.user.id) return;
  if (copy.status !== "SUBMITTED" && copy.status !== "ASSIGNED") return;

  await prisma.answerCopy.update({ where: { id: copyId }, data: { status: "UNDER_EVALUATION" } });
  revalidatePath("/admin/answer-copies");
}

const evaluationSchema = z.object({
  marksAwarded: z.coerce.number().min(0),
  totalMarks: z.coerce.number().min(1),
  remarks: z.string().max(1000).optional(),
  checkedFileUrl: z.string().optional(),
});

export type SubmitEvaluationState = { error?: string; success?: boolean };

export async function submitEvaluation(
  copyId: string,
  _prev: SubmitEvaluationState,
  formData: FormData
): Promise<SubmitEvaluationState> {
  const session = await requireUser();
  const copy = await prisma.answerCopy.findUnique({ where: { id: copyId }, include: { student: true } });
  if (!copy || copy.teacherId !== session.user.id) return { error: "अनधिकृत" };

  const parsed = evaluationSchema.safeParse({
    marksAwarded: formData.get("marksAwarded"),
    totalMarks: formData.get("totalMarks"),
    remarks: formData.get("remarks") || undefined,
    checkedFileUrl: formData.get("checkedFileUrl") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "अमान्य जानकारी" };
  const data = parsed.data;
  if (data.marksAwarded > data.totalMarks) return { error: "प्राप्त अंक कुल अंकों से अधिक नहीं हो सकते" };

  await prisma.answerCopy.update({
    where: { id: copyId },
    data: {
      status: "CHECKED",
      marksAwarded: data.marksAwarded,
      totalMarks: data.totalMarks,
      remarks: data.remarks || null,
      checkedFileUrl: data.checkedFileUrl || null,
      checkedAt: new Date(),
    },
  });

  if (copy.student.email) {
    const { html, text } = renderNotification(
      `<p>नमस्ते ${copy.student.name},</p>
       <p>आपकी उत्तरपुस्तिका "${copy.paperName}" जाँच ली गई है — <strong>${data.marksAwarded} / ${data.totalMarks}</strong> अंक।</p>
       ${data.remarks ? `<p><strong>टिप्पणी:</strong> ${data.remarks}</p>` : ""}`,
      `आपकी उत्तरपुस्तिका "${copy.paperName}" जाँच ली गई है — ${data.marksAwarded} / ${data.totalMarks} अंक।`
    );
    await sendEmail({ to: copy.student.email, subject: "परीक्षा साथी: उत्तरपुस्तिका जाँच पूर्ण", html, text });
  }

  revalidatePath("/admin/answer-copies");
  revalidatePath("/answer-copies");
  return { success: true };
}
