"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";
import { sendEmail, renderNotification } from "@/lib/email";
import { getT } from "@/lib/i18n/server";

function generateTempPassword() {
  return randomBytes(6).toString("base64url");
}

const teacherSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/)
    .optional()
    .or(z.literal("")),
  subjects: z.array(z.string()).default([]),
});

export type TeacherFormState = { error?: string; success?: boolean };

export async function createTeacher(_prev: TeacherFormState, formData: FormData): Promise<TeacherFormState> {
  const t = await getT();
  const session = await requireRole(["SUPER_ADMIN"]);

  const parsed = teacherSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    mobile: formData.get("mobile") || "",
    subjects: formData.getAll("subjects").map(String),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? t("admin.teachers.errors.invalid") };
  const data = parsed.data;

  const existing = await prisma.user.findFirst({ where: { email: data.email } });
  if (existing) return { error: t("admin.teachers.errors.emailTaken") };

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const teacher = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      mobile: data.mobile || null,
      passwordHash,
      role: "TEACHER",
      isActive: true,
      subjects: { connect: data.subjects.map((id) => ({ id })) },
    },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "TeacherAccount", entityId: teacher.id });

  const { html, text } = renderNotification(
    `<p>नमस्ते ${teacher.name},</p>
     <p>परीक्षा साथी पोर्टल पर आपके लिए शिक्षक खाता बनाया गया है।</p>
     <p><strong>ईमेल:</strong> ${teacher.email}<br/><strong>अस्थायी पासवर्ड:</strong> ${tempPassword}</p>
     <p>कृपया लॉगिन कर अपना पासवर्ड बदल लें।</p>`,
    `आपका शिक्षक खाता बन गया है — ईमेल: ${teacher.email}, अस्थायी पासवर्ड: ${tempPassword}`
  );
  await sendEmail({ to: teacher.email, subject: "परीक्षा साथी: शिक्षक खाता बना", html, text });

  revalidatePath("/admin/teachers");
  redirect("/admin/teachers");
}

export async function updateTeacher(id: string, _prev: TeacherFormState, formData: FormData): Promise<TeacherFormState> {
  const t = await getT();
  const session = await requireRole(["SUPER_ADMIN"]);

  const parsed = teacherSchema.omit({ email: true }).safeParse({
    name: formData.get("name"),
    mobile: formData.get("mobile") || "",
    subjects: formData.getAll("subjects").map(String),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? t("admin.teachers.errors.invalid") };
  const data = parsed.data;

  await prisma.user.update({
    where: { id, role: "TEACHER" },
    data: {
      name: data.name,
      mobile: data.mobile || null,
      subjects: { set: data.subjects.map((sid) => ({ id: sid })) },
    },
  });

  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "TeacherAccount", entityId: id });
  revalidatePath("/admin/teachers");
  redirect("/admin/teachers");
}

export async function toggleTeacherActive(id: string, next: boolean) {
  const session = await requireRole(["SUPER_ADMIN"]);
  await prisma.user.update({ where: { id, role: "TEACHER" }, data: { isActive: next } });
  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entity: "TeacherAccount",
    entityId: id,
    meta: { isActive: next },
  });
  revalidatePath("/admin/teachers");
}

export async function resetTeacherPassword(id: string) {
  const session = await requireRole(["SUPER_ADMIN"]);
  const teacher = await prisma.user.findUnique({ where: { id, role: "TEACHER" } });
  if (!teacher) return;

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);
  await prisma.user.update({ where: { id }, data: { passwordHash } });

  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "TeacherAccount", entityId: id, meta: { action: "password_reset" } });

  const { html, text } = renderNotification(
    `<p>नमस्ते ${teacher.name},</p>
     <p>आपका पासवर्ड रीसेट कर दिया गया है।</p>
     <p><strong>नया अस्थायी पासवर्ड:</strong> ${tempPassword}</p>
     <p>कृपया लॉगिन कर इसे तुरंत बदल लें।</p>`,
    `आपका नया अस्थायी पासवर्ड: ${tempPassword}`
  );
  await sendEmail({ to: teacher.email, subject: "परीक्षा साथी: पासवर्ड रीसेट", html, text });

  revalidatePath("/admin/teachers");
}
