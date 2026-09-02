"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";

export async function setLeaderboardVisibility(visible: boolean) {
  const session = await requireUser();
  await prisma.user.update({ where: { id: session.user.id }, data: { onLeaderboard: visible } });
  revalidatePath("/leaderboard");
}
