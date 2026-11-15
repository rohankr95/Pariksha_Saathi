"use server";

import { revalidatePath } from "next/cache";
import type { FeedbackStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";

export async function setFeedbackStatus(id: string, status: FeedbackStatus) {
  const session = await requireRole(["SUPER_ADMIN"]);
  await prisma.feedback.update({ where: { id }, data: { status } });
  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Feedback", entityId: id, meta: { status } });
  revalidatePath("/admin/feedback");
}

export async function deleteFeedback(id: string) {
  const session = await requireRole(["SUPER_ADMIN"]);
  await prisma.feedback.delete({ where: { id } });
  await logAudit({ userId: session.user.id, action: "DELETE", entity: "Feedback", entityId: id });
  revalidatePath("/admin/feedback");
}
