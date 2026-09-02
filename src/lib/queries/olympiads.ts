import { prisma } from "@/lib/prisma";

export async function getOlympiads() {
  return prisma.olympiad.findMany({
    where: { isPublished: true },
    orderBy: { regEnd: "asc" },
  });
}

export async function getOlympiadById(id: string) {
  return prisma.olympiad.findFirst({ where: { id, isPublished: true } });
}

export async function getInterestedOlympiadIds(userId: string) {
  const rows = await prisma.olympiadInterest.findMany({ where: { studentId: userId }, select: { olympiadId: true } });
  return new Set(rows.map((r) => r.olympiadId));
}
