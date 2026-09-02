import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function getAdminTeachers({ q, page = 1 }: { q?: string; page?: number }) {
  const where = {
    role: "TEACHER" as const,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        isActive: true,
        subjects: { select: { id: true, nameHi: true, nameEn: true, classLevel: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getTeacherById(id: string) {
  return prisma.user.findUnique({
    where: { id, role: "TEACHER" },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      isActive: true,
      subjects: { select: { id: true } },
    },
  });
}
