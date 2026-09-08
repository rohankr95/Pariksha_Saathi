import { prisma } from "@/lib/prisma";

const HOME_LIMIT = 8;

export async function getFeaturedToppers() {
  const latestYear = await prisma.topper.findFirst({
    where: { isPublished: true },
    orderBy: { examYear: "desc" },
    select: { examYear: true },
  });
  if (!latestYear) return [];

  return prisma.topper.findMany({
    where: { isPublished: true, examYear: latestYear.examYear },
    orderBy: [{ displayOrder: "asc" }, { rank: "asc" }, { percentage: "desc" }],
    take: HOME_LIMIT,
  });
}

const PAGE_SIZE = 20;

export async function getAdminToppers(params: { q?: string; page?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const where = {
    deletedAt: null,
    ...(params.q ? { studentName: { contains: params.q, mode: "insensitive" as const } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.topper.findMany({
      where,
      orderBy: [{ examYear: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.topper.count({ where }),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
