import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function getAdminAnnouncements({ page = 1 }: { page?: number }) {
  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.announcement.count(),
  ]);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
