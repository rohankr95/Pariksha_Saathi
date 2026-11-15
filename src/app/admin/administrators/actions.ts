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

const createSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email(),
    mobile: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/)
      .optional()
      .or(z.literal("")),
    password: z.string().min(8).max(100),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.password === d.confirmPassword, { message: "mismatch", path: ["confirmPassword"] });

// `values` echoes the typed fields back on error, since React resets the
// uncontrolled form after an action runs (passwords are intentionally dropped).
export type AdminFormState = {
  error?: string;
  success?: boolean;
  values?: { name: string; email: string; mobile: string };
};

export async function createAdmin(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const t = await getT();
  const session = await requireRole(["SUPER_ADMIN"]);

  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    mobile: String(formData.get("mobile") ?? ""),
  };

  const parsed = createSchema.safeParse({
    ...values,
    mobile: values.mobile || "",
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const key =
      issue?.path[0] === "confirmPassword" ? "mismatch" : issue?.path[0] === "password" ? "weakPassword" : "invalid";
    return { error: t(`admin.administrators.errors.${key}`), values };
  }
  const data = parsed.data;

  const existing = await prisma.user.findFirst({ where: { email: data.email } });
  if (existing) return { error: t("admin.administrators.errors.emailTaken"), values };

  const passwordHash = await bcrypt.hash(data.password, 12);
  const admin = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      mobile: data.mobile || null,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "SuperAdminAccount", entityId: admin.id });

  const { html, text } = renderNotification(
    `<p>नमस्ते ${admin.name},</p>
     <p>परीक्षा साथी पोर्टल पर आपके लिए सुपर एडमिन खाता बनाया गया है।</p>
     <p><strong>ईमेल:</strong> ${admin.email}</p>
     <p>कृपया आपको दिया गया पासवर्ड उपयोग कर लॉगिन करें और उसे तुरंत बदल लें।</p>`,
    `आपका सुपर एडमिन खाता बन गया है — ईमेल: ${admin.email}. कृपया लॉगिन कर पासवर्ड बदल लें।`
  );
  await sendEmail({ to: admin.email, subject: "परीक्षा साथी: सुपर एडमिन खाता बना", html, text });

  revalidatePath("/admin/administrators");
  redirect("/admin/administrators");
}

export async function toggleAdminActive(id: string, next: boolean) {
  const session = await requireRole(["SUPER_ADMIN"]);
  // Never let an admin lock themselves out.
  if (id === session.user.id) return;
  // Keep at least one active Super Admin at all times.
  if (!next) {
    const otherActive = await prisma.user.count({
      where: { role: "SUPER_ADMIN", isActive: true, id: { not: id } },
    });
    if (otherActive === 0) return;
  }
  await prisma.user.update({ where: { id, role: "SUPER_ADMIN" }, data: { isActive: next } });
  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entity: "SuperAdminAccount",
    entityId: id,
    meta: { isActive: next },
  });
  revalidatePath("/admin/administrators");
}

export async function resetAdminPassword(id: string) {
  const session = await requireRole(["SUPER_ADMIN"]);
  // Self-service password change is under My Profile → Change Password.
  if (id === session.user.id) return;
  const admin = await prisma.user.findUnique({ where: { id, role: "SUPER_ADMIN" } });
  if (!admin) return;

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);
  await prisma.user.update({ where: { id }, data: { passwordHash } });

  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entity: "SuperAdminAccount",
    entityId: id,
    meta: { action: "password_reset" },
  });

  const { html, text } = renderNotification(
    `<p>नमस्ते ${admin.name},</p>
     <p>आपका सुपर एडमिन पासवर्ड रीसेट कर दिया गया है।</p>
     <p><strong>नया अस्थायी पासवर्ड:</strong> ${tempPassword}</p>
     <p>कृपया लॉगिन कर इसे तुरंत बदल लें।</p>`,
    `आपका नया अस्थायी पासवर्ड: ${tempPassword}`
  );
  await sendEmail({ to: admin.email, subject: "परीक्षा साथी: पासवर्ड रीसेट", html, text });

  revalidatePath("/admin/administrators");
}
