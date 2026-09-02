import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

export async function getStories(params: { tag?: string; page?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const where = {
    isPublished: true,
    deletedAt: null,
    ...(params.tag ? { tags: { has: params.tag } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.story.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.story.count({ where }),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getStoryById(id: string) {
  return prisma.story.findFirst({ where: { id, isPublished: true, deletedAt: null } });
}
