"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";

const noteSchema = z.object({
  title: z.string().min(3).max(200),
  subjectId: z.string().min(1),
  chapterId: z.string().optional(),
  classLevel: z.enum(["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"]),
  language: z.enum(["HINDI", "ENGLISH", "CHHATTISGARHI"]),
  tags: z.array(z.string()).default([]),
  fileUrl: z.string().min(1),
  fileSizeBytes: z.coerce.number().int().min(1),
});

function parseForm(formData: FormData) {
  return noteSchema.parse({
    title: formData.get("title"),
    subjectId: formData.get("subjectId"),
    chapterId: formData.get("chapterId") || undefined,
    classLevel: formData.get("classLevel"),
    language: formData.get("language"),
    tags: formData.getAll("tags").map(String),
    fileUrl: formData.get("fileUrl"),
    fileSizeBytes: formData.get("fileSizeBytes"),
  });
}

export async function createNote(formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);
  const maxOrder = await prisma.note.aggregate({ _max: { displayOrder: true } });

  const note = await prisma.note.create({
    data: {
      ...data,
      chapterId: data.chapterId || null,
      displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
      isPublished: formData.get("isPublished") === "on",
      createdById: session.user.id,
    },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Note", entityId: note.id });
  revalidatePath("/admin/notes");
  revalidatePath("/notes");
  redirect("/admin/notes");
}

export async function updateNote(id: string, formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  const existing = await prisma.note.findUnique({ where: { id } });
  if (existing && existing.fileUrl !== data.fileUrl) {
    // Keep a version record of the file being replaced, then update.
    await prisma.noteVersion.create({ data: { noteId: id, fileUrl: existing.fileUrl } });
  }

  await prisma.note.update({
    where: { id },
    data: {
      ...data,
      chapterId: data.chapterId || null,
      isPublished: formData.get("isPublished") === "on",
    },
  });

  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Note", entityId: id });
  revalidatePath("/admin/notes");
  revalidatePath("/notes");
  redirect("/admin/notes");
}

export async function deleteNote(id: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.note.update({ where: { id }, data: { deletedAt: new Date(), isPublished: false } });
  await logAudit({ userId: session.user.id, action: "DELETE", entity: "Note", entityId: id });
  revalidatePath("/admin/notes");
  revalidatePath("/notes");
}

export async function toggleNotePublish(id: string, next: boolean) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.note.update({ where: { id }, data: { isPublished: next } });
  await logAudit({
    userId: session.user.id,
    action: next ? "PUBLISH" : "UNPUBLISH",
    entity: "Note",
    entityId: id,
  });
  revalidatePath("/admin/notes");
  revalidatePath("/notes");
}

export async function moveNoteOrder(id: string, direction: "up" | "down") {
  await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const current = await prisma.note.findUnique({ where: { id } });
  if (!current) return;

  const neighbor = await prisma.note.findFirst({
    where: {
      subjectId: current.subjectId,
      deletedAt: null,
      displayOrder: direction === "up" ? { lt: current.displayOrder } : { gt: current.displayOrder },
    },
    orderBy: { displayOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;

  await prisma.$transaction([
    prisma.note.update({ where: { id: current.id }, data: { displayOrder: neighbor.displayOrder } }),
    prisma.note.update({ where: { id: neighbor.id }, data: { displayOrder: current.displayOrder } }),
  ]);
  revalidatePath("/admin/notes");
}
