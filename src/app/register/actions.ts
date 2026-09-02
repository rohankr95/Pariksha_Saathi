"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "अमान्य मोबाइल नंबर"),
  classLevel: z.enum(["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"]),
  school: z.string().min(2).max(150),
  block: z.string().min(1).max(100),
});

export type RegisterState = { error?: string; success?: boolean };

export async function registerStudent(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    mobile: formData.get("mobile"),
    classLevel: formData.get("classLevel"),
    school: formData.get("school"),
    block: formData.get("block"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "अमान्य जानकारी" };
  }

  const { name, email, password, mobile, classLevel, school, block } = parsed.data;

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { mobile }] } });
  if (existing) {
    return { error: "इस ईमेल या मोबाइल नंबर से पहले से खाता मौजूद है" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      mobile,
      passwordHash,
      role: "STUDENT",
      classLevel,
      school,
      block,
      displayName: name.split(" ")[0],
      streak: { create: {} },
    },
  });

  return { success: true };
}
