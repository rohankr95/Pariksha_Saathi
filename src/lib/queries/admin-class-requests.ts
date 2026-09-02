import { prisma } from "@/lib/prisma";
import type { ClassRequestStatus } from "@prisma/client";

const PAGE_SIZE = 20;

export async function getAdminClassRequests(params: { status?: ClassRequestStatus; page?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const where = params.status ? { status: params.status } : {};
  const [items, total] = await Promise.all([
    prisma.classRequest.findMany({
      where,
      include: {
        student: { select: { name: true, school: true, block: true } },
        subject: true,
        preferredTeacher: { select: { name: true } },
      },
      orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.classRequest.count({ where }),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
