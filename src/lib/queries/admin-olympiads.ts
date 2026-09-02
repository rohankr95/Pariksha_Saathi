import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function getAdminOlympiads(params: { q?: string; page?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const where = {
    ...(params.q ? { name: { contains: params.q, mode: "insensitive" as const } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.olympiad.findMany({
      where,
      include: { _count: { select: { interests: true } } },
      orderBy: { regEnd: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.olympiad.count({ where }),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getOlympiadInterestList(olympiadId: string) {
  const olympiad = await prisma.olympiad.findUnique({ where: { id: olympiadId } });
  const interests = await prisma.olympiadInterest.findMany({
    where: { olympiadId },
    include: { student: { select: { name: true, school: true, block: true, classLevel: true, mobile: true } } },
    orderBy: { createdAt: "asc" },
  });
  return { olympiad, interests };
}
