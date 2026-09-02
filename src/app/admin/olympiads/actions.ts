"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";

const dateField = z
  .string()
  .optional()
  .transform((v) => (v ? new Date(v) : undefined));

const olympiadSchema = z.object({
  name: z.string().min(3).max(200),
  body: z.string().min(2).max(150),
  eligibleClasses: z.array(z.enum(["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"])).min(1),
  regStart: dateField,
  regEnd: dateField,
  fee: z.string().max(50).optional(),
  pattern: z.string().max(500).optional(),
  officialUrl: z.string().optional(),
  syllabusUrl: z.string().optional(),
  previousPapersUrl: z.string().optional(),
});

function parseForm(formData: FormData) {
  return olympiadSchema.parse({
    name: formData.get("name"),
    body: formData.get("body"),
    eligibleClasses: formData.getAll("eligibleClasses").map(String),
    regStart: formData.get("regStart") || undefined,
    regEnd: formData.get("regEnd") || undefined,
    fee: formData.get("fee") || undefined,
    pattern: formData.get("pattern") || undefined,
    officialUrl: formData.get("officialUrl") || undefined,
    syllabusUrl: formData.get("syllabusUrl") || undefined,
    previousPapersUrl: formData.get("previousPapersUrl") || undefined,
  });
}

export async function createOlympiad(formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  const olympiad = await prisma.olympiad.create({
    data: { ...data, isPublished: formData.get("isPublished") === "on" },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Olympiad", entityId: olympiad.id });
  revalidatePath("/admin/olympiads");
  revalidatePath("/olympiad");
  redirect("/admin/olympiads");
}

export async function updateOlympiad(id: string, formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  await prisma.olympiad.update({
    where: { id },
    data: { ...data, isPublished: formData.get("isPublished") === "on" },
  });

  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Olympiad", entityId: id });
  revalidatePath("/admin/olympiads");
  revalidatePath("/olympiad");
  redirect("/admin/olympiads");
}

export async function deleteOlympiad(id: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.olympiad.delete({ where: { id } });
  await logAudit({ userId: session.user.id, action: "DELETE", entity: "Olympiad", entityId: id });
  revalidatePath("/admin/olympiads");
  revalidatePath("/olympiad");
}

export async function toggleOlympiadPublish(id: string, next: boolean) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.olympiad.update({ where: { id }, data: { isPublished: next } });
  await logAudit({
    userId: session.user.id,
    action: next ? "PUBLISH" : "UNPUBLISH",
    entity: "Olympiad",
    entityId: id,
  });
  revalidatePath("/admin/olympiads");
  revalidatePath("/olympiad");
}
