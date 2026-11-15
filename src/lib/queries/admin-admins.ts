import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function getAdminAdmins({ q, page = 1 }: { q?: string; page?: number }) {
  const where = {
    role: "SUPER_ADMIN" as const,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total, activeCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, mobile: true, isActive: true, createdAt: true },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: "SUPER_ADMIN", isActive: true } }),
  ]);

  return { items, total, activeCount, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
