"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";

const submissionSchema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().min(20).max(5000),
});

export type SubmitStoryState = { error?: string; success?: boolean };

export async function submitStory(
  _prevState: SubmitStoryState,
  formData: FormData
): Promise<SubmitStoryState> {
  const session = await requireUser();
  const parsed = submissionSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "अमान्य जानकारी" };
  }

  await prisma.story.create({
    data: {
      title: parsed.data.title,
      personName: session.user.displayName || session.user.name || "विद्यार्थी",
      body: parsed.data.body,
      block: undefined,
      isSubmission: true,
      isPublished: false,
      submittedById: session.user.id,
      tags: [],
    },
  });

  return { success: true };
}
