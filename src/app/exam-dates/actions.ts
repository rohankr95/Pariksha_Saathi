"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";

export async function subscribeToExam(examId: string) {
  const session = await requireUser();
  await prisma.examSubscription.upsert({
    where: { userId_examId: { userId: session.user.id, examId } },
    update: {},
    create: { userId: session.user.id, examId },
  });
  revalidatePath("/exam-dates");
}

export async function unsubscribeFromExam(examId: string) {
  const session = await requireUser();
  await prisma.examSubscription
    .delete({ where: { userId_examId: { userId: session.user.id, examId } } })
    .catch(() => {});
  revalidatePath("/exam-dates");
}
