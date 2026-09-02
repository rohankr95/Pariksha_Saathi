"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";
import { findSimilarOpenRequest } from "@/lib/queries/class-requests";

const requestSchema = z.object({
  subjectId: z.string().min(1),
  chapter: z.string().max(150).optional(),
  classLevel: z.enum(["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"]),
  preferredTeacherId: z.string().optional(),
  mode: z.enum(["ONLINE", "OFFLINE"]),
  preferredTime: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  urgency: z.enum(["low", "normal", "high"]),
});

export type SubmitClassRequestState = { error?: string; success?: boolean; mergedIntoExisting?: boolean };

export async function submitClassRequest(
  _prev: SubmitClassRequestState,
  formData: FormData
): Promise<SubmitClassRequestState> {
  const session = await requireUser();
  if (session.user.role !== "STUDENT") return { error: "केवल विद्यार्थी अनुरोध भेज सकते हैं" };

  const parsed = requestSchema.safeParse({
    subjectId: formData.get("subjectId"),
    chapter: formData.get("chapter") || undefined,
    classLevel: formData.get("classLevel"),
    preferredTeacherId: formData.get("preferredTeacherId") || undefined,
    mode: formData.get("mode"),
    preferredTime: formData.get("preferredTime") || undefined,
    description: formData.get("description") || undefined,
    urgency: formData.get("urgency"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "अमान्य जानकारी" };

  const data = parsed.data;

  if (data.chapter) {
    const similar = await findSimilarOpenRequest(data.subjectId, data.chapter, data.classLevel);
    if (similar && similar.studentId !== session.user.id) {
      if (!similar.upvoterIds.includes(session.user.id)) {
        await prisma.classRequest.update({
          where: { id: similar.id },
          data: { upvoterIds: { push: session.user.id }, upvotes: { increment: 1 } },
        });
      }
      revalidatePath("/class-request");
      return { success: true, mergedIntoExisting: true };
    }
  }

  await prisma.classRequest.create({
    data: {
      studentId: session.user.id,
      subjectId: data.subjectId,
      chapter: data.chapter,
      classLevel: data.classLevel,
      preferredTeacherId: data.preferredTeacherId || null,
      mode: data.mode,
      preferredTime: data.preferredTime,
      description: data.description,
      urgency: data.urgency,
    },
  });

  revalidatePath("/class-request");
  return { success: true };
}

export async function upvoteClassRequest(requestId: string) {
  const session = await requireUser();
  const request = await prisma.classRequest.findUnique({ where: { id: requestId } });
  if (!request || request.upvoterIds.includes(session.user.id)) return;

  await prisma.classRequest.update({
    where: { id: requestId },
    data: { upvoterIds: { push: session.user.id }, upvotes: { increment: 1 } },
  });
  revalidatePath("/class-request");
}
