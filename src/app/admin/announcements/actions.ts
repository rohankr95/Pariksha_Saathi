"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";

const announcementSchema = z.object({
  textHi: z.string().min(3).max(300),
  textEn: z.string().max(300).optional(),
  link: z.string().max(500).optional(),
  expiresAt: z.string().optional(),
});

function parseForm(formData: FormData) {
  return announcementSchema.parse({
    textHi: formData.get("textHi"),
    textEn: formData.get("textEn") || undefined,
    link: formData.get("link") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
  });
}

export async function createAnnouncement(formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  const announcement = await prisma.announcement.create({
    data: {
      textHi: data.textHi,
      textEn: data.textEn || null,
      link: data.link || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: formData.get("isActive") === "on",
    },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Announcement", entityId: announcement.id });
  revalidatePath("/admin/announcements");
  revalidatePath("/");
  redirect("/admin/announcements");
}

export async function updateAnnouncement(id: string, formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  await prisma.announcement.update({
    where: { id },
    data: {
      textHi: data.textHi,
      textEn: data.textEn || null,
      link: data.link || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: formData.get("isActive") === "on",
    },
  });

  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Announcement", entityId: id });
  revalidatePath("/admin/announcements");
  revalidatePath("/");
  redirect("/admin/announcements");
}

export async function deleteAnnouncement(id: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.announcement.delete({ where: { id } });
  await logAudit({ userId: session.user.id, action: "DELETE", entity: "Announcement", entityId: id });
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

export async function toggleAnnouncementActive(id: string, next: boolean) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.announcement.update({ where: { id }, data: { isActive: next } });
  await logAudit({
    userId: session.user.id,
    action: next ? "PUBLISH" : "UNPUBLISH",
    entity: "Announcement",
    entityId: id,
  });
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}
