"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";
import { getT } from "@/lib/i18n/server";

const chapterSchema = z.object({
  nameHi: z.string().min(1).max(120),
  nameEn: z.string().min(1).max(120),
});

export type ChapterFormState = { error?: string };

export async function createChapter(subjectId: string, _prev: ChapterFormState, formData: FormData): Promise<ChapterFormState> {
  const t = await getT();
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);

  const parsed = chapterSchema.safeParse({
    nameHi: formData.get("nameHi"),
    nameEn: formData.get("nameEn"),
  });
  if (!parsed.success) return { error: t("admin.subjects.chapters.errors.invalid") };

  const maxOrder = await prisma.chapter.aggregate({ where: { subjectId }, _max: { displayOrder: true } });

  const chapter = await prisma.chapter.create({
    data: { ...parsed.data, subjectId, displayOrder: (maxOrder._max.displayOrder ?? 0) + 1 },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Chapter", entityId: chapter.id });
  revalidatePath(`/admin/subjects/${subjectId}/chapters`);
  redirect(`/admin/subjects/${subjectId}/chapters`);
}

export async function updateChapter(
  chapterId: string,
  subjectId: string,
  _prev: ChapterFormState,
  formData: FormData
): Promise<ChapterFormState> {
  const t = await getT();
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);

  const parsed = chapterSchema.safeParse({
    nameHi: formData.get("nameHi"),
    nameEn: formData.get("nameEn"),
  });
  if (!parsed.success) return { error: t("admin.subjects.chapters.errors.invalid") };

  await prisma.chapter.update({ where: { id: chapterId }, data: parsed.data });

  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Chapter", entityId: chapterId });
  revalidatePath(`/admin/subjects/${subjectId}/chapters`);
  redirect(`/admin/subjects/${subjectId}/chapters`);
}

export async function deleteChapter(chapterId: string, subjectId: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.chapter.delete({ where: { id: chapterId } });
  await logAudit({ userId: session.user.id, action: "DELETE", entity: "Chapter", entityId: chapterId });
  revalidatePath(`/admin/subjects/${subjectId}/chapters`);
}

export async function moveChapterOrder(chapterId: string, subjectId: string, direction: "up" | "down") {
  await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const current = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!current) return;

  const neighbor = await prisma.chapter.findFirst({
    where: {
      subjectId,
      displayOrder: direction === "up" ? { lt: current.displayOrder } : { gt: current.displayOrder },
    },
    orderBy: { displayOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;

  await prisma.$transaction([
    prisma.chapter.update({ where: { id: current.id }, data: { displayOrder: neighbor.displayOrder } }),
    prisma.chapter.update({ where: { id: neighbor.id }, data: { displayOrder: current.displayOrder } }),
  ]);
  revalidatePath(`/admin/subjects/${subjectId}/chapters`);
}
