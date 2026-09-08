"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";

const topperSchema = z.object({
  studentName: z.string().min(2).max(150),
  fatherName: z.string().max(150).optional(),
  motherName: z.string().max(150).optional(),
  school: z.string().min(2).max(200),
  block: z.string().max(100).optional(),
  classLevel: z.enum(["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"]),
  examYear: z.coerce.number().int().min(2000).max(2100),
  percentage: z.coerce.number().min(0).max(100).optional(),
  rank: z.coerce.number().int().min(1).optional(),
  photoUrl: z.string().optional(),
  displayOrder: z.coerce.number().int().default(0),
});

function parseForm(formData: FormData) {
  return topperSchema.parse({
    studentName: formData.get("studentName"),
    fatherName: formData.get("fatherName") || undefined,
    motherName: formData.get("motherName") || undefined,
    school: formData.get("school"),
    block: formData.get("block") || undefined,
    classLevel: formData.get("classLevel"),
    examYear: formData.get("examYear"),
    percentage: formData.get("percentage") || undefined,
    rank: formData.get("rank") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
    displayOrder: formData.get("displayOrder") || 0,
  });
}

export async function createTopper(formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  const topper = await prisma.topper.create({
    data: { ...data, isPublished: formData.get("isPublished") === "on" },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Topper", entityId: topper.id });
  revalidatePath("/admin/toppers");
  revalidatePath("/");
  redirect("/admin/toppers");
}

export async function updateTopper(id: string, formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  await prisma.topper.update({
    where: { id },
    data: { ...data, isPublished: formData.get("isPublished") === "on" },
  });

  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Topper", entityId: id });
  revalidatePath("/admin/toppers");
  revalidatePath("/");
  redirect("/admin/toppers");
}

export async function deleteTopper(id: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.topper.update({ where: { id }, data: { deletedAt: new Date(), isPublished: false } });
  await logAudit({ userId: session.user.id, action: "DELETE", entity: "Topper", entityId: id });
  revalidatePath("/admin/toppers");
  revalidatePath("/");
}

export async function toggleTopperPublish(id: string, next: boolean) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.topper.update({ where: { id }, data: { isPublished: next } });
  await logAudit({
    userId: session.user.id,
    action: next ? "PUBLISH" : "UNPUBLISH",
    entity: "Topper",
    entityId: id,
  });
  revalidatePath("/admin/toppers");
  revalidatePath("/");
}
