"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";

const storySchema = z.object({
  title: z.string().min(3).max(200),
  personName: z.string().min(2).max(150),
  designation: z.string().max(150).optional(),
  district: z.string().max(100).optional(),
  block: z.string().max(100).optional(),
  body: z.string().max(5000).optional(),
  videoUrl: z.string().optional(),
  photoUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

function parseForm(formData: FormData) {
  return storySchema.parse({
    title: formData.get("title"),
    personName: formData.get("personName"),
    designation: formData.get("designation") || undefined,
    district: formData.get("district") || undefined,
    block: formData.get("block") || undefined,
    body: formData.get("body") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
    tags: formData.getAll("tags").map(String),
  });
}

export async function createStory(formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  const story = await prisma.story.create({
    data: {
      ...data,
      isFeatured: formData.get("isFeatured") === "on",
      isPublished: formData.get("isPublished") === "on",
    },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Story", entityId: story.id });
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
  redirect("/admin/stories");
}

export async function updateStory(id: string, formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  await prisma.story.update({
    where: { id },
    data: {
      ...data,
      isFeatured: formData.get("isFeatured") === "on",
      isPublished: formData.get("isPublished") === "on",
    },
  });

  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Story", entityId: id });
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
  redirect("/admin/stories");
}

export async function deleteStory(id: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.story.update({ where: { id }, data: { deletedAt: new Date(), isPublished: false } });
  await logAudit({ userId: session.user.id, action: "DELETE", entity: "Story", entityId: id });
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
}

export async function toggleStoryPublish(id: string, next: boolean) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.story.update({ where: { id }, data: { isPublished: next } });
  await logAudit({
    userId: session.user.id,
    action: next ? "PUBLISH" : "UNPUBLISH",
    entity: "Story",
    entityId: id,
  });
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
}

export async function toggleStoryFeatured(id: string, next: boolean) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.story.update({ where: { id }, data: { isFeatured: next } });
  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Story", entityId: id });
  revalidatePath("/admin/stories");
  revalidatePath("/");
}
