"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function reportBrokenLink(lectureId: string, note: string) {
  const session = await auth();
  await prisma.brokenLinkReport.create({
    data: { lectureId, note: note.slice(0, 500), reporterId: session?.user?.id },
  });
  return { success: true };
}

export async function toggleWatched(lectureId: string, watched: boolean) {
  const session = await auth();
  if (!session?.user) return;
  await prisma.lectureWatchProgress.upsert({
    where: { lectureId_userId: { lectureId, userId: session.user.id } },
    update: { watched },
    create: { lectureId, userId: session.user.id, watched },
  });
  revalidatePath(`/lectures/${lectureId}`);
}

export async function recordView(lectureId: string) {
  await prisma.lecture.update({ where: { id: lectureId }, data: { views: { increment: 1 } } });
}
