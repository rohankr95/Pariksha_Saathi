"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";
import { youtubeThumbnail } from "@/lib/youtube";

const lectureSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  youtubeUrl: z.string().url(),
  subjectId: z.string().min(1),
  chapterId: z.string().optional(),
  classLevel: z.enum(["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"]),
  language: z.enum(["HINDI", "ENGLISH", "CHHATTISGARHI"]),
  durationSec: z.coerce.number().int().min(0).optional(),
  tags: z.array(z.string()).default([]),
});

function parseForm(formData: FormData) {
  return lectureSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    youtubeUrl: formData.get("youtubeUrl"),
    subjectId: formData.get("subjectId"),
    chapterId: formData.get("chapterId") || undefined,
    classLevel: formData.get("classLevel"),
    language: formData.get("language"),
    durationSec: formData.get("durationSec") || undefined,
    tags: formData.getAll("tags").map(String),
  });
}

export async function createLecture(formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  const maxOrder = await prisma.lecture.aggregate({ _max: { displayOrder: true } });

  const lecture = await prisma.lecture.create({
    data: {
      ...data,
      chapterId: data.chapterId || null,
      thumbnailUrl: youtubeThumbnail(data.youtubeUrl),
      displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
      isPublished: formData.get("isPublished") === "on",
      createdById: session.user.id,
    },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Lecture", entityId: lecture.id });
  revalidatePath("/admin/lectures");
  revalidatePath("/lectures");
  redirect("/admin/lectures");
}

export async function updateLecture(id: string, formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  await prisma.lecture.update({
    where: { id },
    data: {
      ...data,
      chapterId: data.chapterId || null,
      thumbnailUrl: youtubeThumbnail(data.youtubeUrl),
      isPublished: formData.get("isPublished") === "on",
    },
  });

  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Lecture", entityId: id });
  revalidatePath("/admin/lectures");
  revalidatePath(`/lectures/${id}`);
  revalidatePath("/lectures");
  redirect("/admin/lectures");
}

export async function deleteLecture(id: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.lecture.update({ where: { id }, data: { deletedAt: new Date(), isPublished: false } });
  await logAudit({ userId: session.user.id, action: "DELETE", entity: "Lecture", entityId: id });
  revalidatePath("/admin/lectures");
  revalidatePath("/lectures");
}

export async function restoreLecture(id: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.lecture.update({ where: { id }, data: { deletedAt: null } });
  await logAudit({ userId: session.user.id, action: "RESTORE", entity: "Lecture", entityId: id });
  revalidatePath("/admin/lectures");
}

export async function toggleLecturePublish(id: string, next: boolean) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.lecture.update({ where: { id }, data: { isPublished: next } });
  await logAudit({
    userId: session.user.id,
    action: next ? "PUBLISH" : "UNPUBLISH",
    entity: "Lecture",
    entityId: id,
  });
  revalidatePath("/admin/lectures");
  revalidatePath("/lectures");
}

export async function moveLectureOrder(id: string, direction: "up" | "down") {
  await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const current = await prisma.lecture.findUnique({ where: { id } });
  if (!current) return;

  const neighbor = await prisma.lecture.findFirst({
    where: {
      subjectId: current.subjectId,
      deletedAt: null,
      displayOrder: direction === "up" ? { lt: current.displayOrder } : { gt: current.displayOrder },
    },
    orderBy: { displayOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;

  await prisma.$transaction([
    prisma.lecture.update({ where: { id: current.id }, data: { displayOrder: neighbor.displayOrder } }),
    prisma.lecture.update({ where: { id: neighbor.id }, data: { displayOrder: current.displayOrder } }),
  ]);
  revalidatePath("/admin/lectures");
}

export async function resolveBrokenLinkReport(reportId: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.brokenLinkReport.update({ where: { id: reportId }, data: { resolved: true } });
  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "BrokenLinkReport", entityId: reportId });
  revalidatePath("/admin/lectures");
}
