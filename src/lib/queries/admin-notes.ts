import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function getAdminNotes(params: { q?: string; page?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const where = {
    deletedAt: null,
    ...(params.q ? { title: { contains: params.q, mode: "insensitive" as const } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.note.findMany({
      where,
      include: { subject: true, chapter: true },
      orderBy: [{ subjectId: "asc" }, { displayOrder: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.note.count({ where }),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
