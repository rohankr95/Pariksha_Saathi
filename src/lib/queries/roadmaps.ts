import { prisma } from "@/lib/prisma";

export async function getRoadmaps(stream?: string) {
  return prisma.careerRoadmap.findMany({
    where: { isPublished: true, ...(stream ? { stream } : {}) },
    orderBy: { title: "asc" },
  });
}

export async function getRoadmapStreams() {
  const rows = await prisma.careerRoadmap.findMany({
    where: { isPublished: true },
    select: { stream: true },
    distinct: ["stream"],
  });
  return rows.map((r) => r.stream);
}

export async function getSuggestedRoadmaps(keywords: string[]) {
  if (keywords.length === 0) return [];
  return prisma.careerRoadmap.findMany({
    where: {
      isPublished: true,
      OR: keywords.map((k) => ({ title: { contains: k, mode: "insensitive" as const } })),
    },
    take: 3,
  });
}

export async function getRoadmapById(id: string) {
  return prisma.careerRoadmap.findFirst({ where: { id, isPublished: true } });
}
