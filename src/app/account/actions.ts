"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";
import { getT } from "@/lib/i18n/server";

const schema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6).max(100),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "mismatch",
    path: ["confirmPassword"],
  });

export type ChangePasswordState = { error?: string; success?: boolean };

export async function changePassword(_prev: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
  const t = await getT();
  const session = await requireUser();

  const parsed = schema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue?.path[0] === "confirmPassword" && issue.message === "mismatch") {
      return { error: t("account.security.errors.mismatch") };
    }
    return { error: t("account.security.errors.tooShort") };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: t("account.security.errors.generic") };

  const currentMatches = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!currentMatches) return { error: t("account.security.errors.wrongCurrent") };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}
