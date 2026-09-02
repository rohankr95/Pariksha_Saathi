"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";

const stepSchema = z.object({ step: z.string().min(1), detail: z.string().min(1) });

const roadmapSchema = z.object({
  title: z.string().min(3).max(150),
  stream: z.string().min(2).max(100),
  overview: z.string().min(10).max(2000),
  eligibility: z.string().max(500).optional(),
  salaryRange: z.string().max(100).optional(),
  scholarships: z.string().max(500).optional(),
  exams: z.array(z.string()).default([]),
  stepsJson: z.string().transform((v, ctx) => {
    try {
      const parsed = JSON.parse(v);
      return z.array(stepSchema).parse(parsed);
    } catch {
      ctx.addIssue({ code: "custom", message: "अमान्य चरण डेटा" });
      return z.NEVER;
    }
  }),
});

function parseForm(formData: FormData) {
  return roadmapSchema.parse({
    title: formData.get("title"),
    stream: formData.get("stream"),
    overview: formData.get("overview"),
    eligibility: formData.get("eligibility") || undefined,
    salaryRange: formData.get("salaryRange") || undefined,
    scholarships: formData.get("scholarships") || undefined,
    exams: String(formData.get("exams") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    stepsJson: formData.get("stepsJson") || "[]",
  });
}

export async function createRoadmap(formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  const roadmap = await prisma.careerRoadmap.create({
    data: { ...data, isPublished: formData.get("isPublished") === "on" },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "CareerRoadmap", entityId: roadmap.id });
  revalidatePath("/admin/career-roadmaps");
  revalidatePath("/career");
  redirect("/admin/career-roadmaps");
}

export async function updateRoadmap(id: string, formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  await prisma.careerRoadmap.update({
    where: { id },
    data: { ...data, isPublished: formData.get("isPublished") === "on" },
  });

  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "CareerRoadmap", entityId: id });
  revalidatePath("/admin/career-roadmaps");
  revalidatePath("/career");
  redirect("/admin/career-roadmaps");
}

export async function deleteRoadmap(id: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.careerRoadmap.delete({ where: { id } });
  await logAudit({ userId: session.user.id, action: "DELETE", entity: "CareerRoadmap", entityId: id });
  revalidatePath("/admin/career-roadmaps");
  revalidatePath("/career");
}

export async function toggleRoadmapPublish(id: string, next: boolean) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.careerRoadmap.update({ where: { id }, data: { isPublished: next } });
  await logAudit({
    userId: session.user.id,
    action: next ? "PUBLISH" : "UNPUBLISH",
    entity: "CareerRoadmap",
    entityId: id,
  });
  revalidatePath("/admin/career-roadmaps");
  revalidatePath("/career");
}
