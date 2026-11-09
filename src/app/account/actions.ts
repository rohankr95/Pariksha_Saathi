"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";
import { getT } from "@/lib/i18n/server";
import { revalidatePath } from "next/cache";
import { unstable_update } from "@/lib/auth";
import { BLOCK_VALUES } from "@/lib/blocks";

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

const MOBILE_RE = /^[6-9]\d{9}$/;

const profileSchema = z.object({
  name: z.string().trim().min(2, "name").max(100, "name"),
  email: z.string().trim().email("email"),
  mobile: z
    .string()
    .trim()
    .refine((v) => v === "" || MOBILE_RE.test(v), "mobile"),
});

const studentProfileSchema = profileSchema.extend({
  mobile: z.string().trim().regex(MOBILE_RE, "mobile"),
  classLevel: z.enum(["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"], { message: "classLevel" }),
  school: z.string().trim().min(2, "school").max(150, "school"),
  block: z.enum(BLOCK_VALUES, { message: "block" }),
  displayName: z.string().trim().max(40, "displayName"),
  onLeaderboard: z.boolean(),
});

export type ProfileValues = {
  name: string;
  email: string;
  mobile: string;
  classLevel: string;
  school: string;
  block: string;
  displayName: string;
  onLeaderboard: boolean;
};

// `values` echoes the submission back on error, because React resets the
// form after an action runs and the user would otherwise lose their edits.
export type UpdateProfileState = { error?: string; success?: boolean; values?: ProfileValues };

export async function updateProfile(_prev: UpdateProfileState, formData: FormData): Promise<UpdateProfileState> {
  const t = await getT();
  const session = await requireUser();
  const isStudent = session.user.role === "STUDENT";

  const str = (k: string) => String(formData.get(k) ?? "");
  const raw: ProfileValues = {
    name: str("name"),
    email: str("email"),
    mobile: str("mobile"),
    classLevel: str("classLevel"),
    school: str("school"),
    block: str("block"),
    displayName: str("displayName"),
    onLeaderboard: formData.get("onLeaderboard") === "on",
  };
  const parsed = isStudent ? studentProfileSchema.safeParse(raw) : profileSchema.safeParse(raw);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.message ?? "generic";
    return { error: t(`account.profile.errors.${field}`), values: raw };
  }
  const base = parsed.data;
  const mobile = base.mobile === "" ? null : base.mobile;

  const clash = await prisma.user.findFirst({
    where: {
      id: { not: session.user.id },
      OR: [{ email: base.email }, ...(mobile ? [{ mobile }] : [])],
    },
    select: { email: true },
  });
  if (clash) {
    return {
      error: t(clash.email === base.email ? "account.profile.errors.emailTaken" : "account.profile.errors.mobileTaken"),
      values: raw,
    };
  }

  const student = isStudent ? studentProfileSchema.parse(raw) : null;
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: base.name,
      email: base.email,
      mobile,
      ...(student && {
        classLevel: student.classLevel,
        school: student.school,
        block: student.block,
        displayName: student.displayName || student.name.split(" ")[0],
        onLeaderboard: student.onLeaderboard,
      }),
    },
  });

  await unstable_update({});
  revalidatePath("/", "layout");
  return { success: true };
}
