"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";

const CATEGORIES = ["SUGGESTION", "PROBLEM", "CONTENT", "OTHER"] as const;

const schema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().max(150).optional(),
  category: z.enum(CATEGORIES).optional(),
  message: z.string().trim().min(5, "tooShort").max(2000, "tooLong"),
});

export type FeedbackState = { error?: string; success?: boolean };

export async function submitFeedback(_prev: FeedbackState, formData: FormData): Promise<FeedbackState> {
  const t = await getT();

  // Honeypot — bots fill hidden fields; humans never see this one.
  if (String(formData.get("website") ?? "") !== "") return { success: true };

  const emailRaw = String(formData.get("email") ?? "").trim();
  if (emailRaw && !z.string().email().safeParse(emailRaw).success) {
    return { error: t("feedback.public.errors.email") };
  }

  const categoryRaw = String(formData.get("category") ?? "");
  const parsed = schema.safeParse({
    name: String(formData.get("name") ?? "").trim() || undefined,
    email: emailRaw || undefined,
    category: (CATEGORIES as readonly string[]).includes(categoryRaw) ? categoryRaw : undefined,
    message: formData.get("message"),
  });
  if (!parsed.success) {
    const key = parsed.error.issues[0]?.message ?? "generic";
    return { error: t(`feedback.public.errors.${key}`) };
  }

  const session = await auth();
  try {
    await prisma.feedback.create({
      data: {
        name: parsed.data.name ?? null,
        email: parsed.data.email ?? null,
        category: parsed.data.category ?? null,
        message: parsed.data.message,
        userId: session?.user?.id ?? null,
        userRole: session?.user?.role ?? null,
      },
    });
  } catch {
    return { error: t("feedback.public.errors.generic") };
  }
  return { success: true };
}
