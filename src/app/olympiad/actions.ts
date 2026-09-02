"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";

export async function registerOlympiadInterest(olympiadId: string) {
  const session = await requireUser();
  await prisma.olympiadInterest.upsert({
    where: { studentId_olympiadId: { studentId: session.user.id, olympiadId } },
    update: {},
    create: { studentId: session.user.id, olympiadId },
  });
  revalidatePath("/olympiad");
}

export async function withdrawOlympiadInterest(olympiadId: string) {
  const session = await requireUser();
  await prisma.olympiadInterest
    .delete({ where: { studentId_olympiadId: { studentId: session.user.id, olympiadId } } })
    .catch(() => {});
  revalidatePath("/olympiad");
}
