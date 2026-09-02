import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 30;

export async function getAdminAuditLog({
  entity,
  action,
  page = 1,
}: {
  entity?: string;
  action?: string;
  page?: number;
}) {
  const where = {
    ...(entity ? { entity } : {}),
    ...(action ? { action } : {}),
  };

  const [items, total, entities] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({ distinct: ["entity"], select: { entity: true }, orderBy: { entity: "asc" } }),
  ]);

  return {
    items,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    entities: entities.map((e) => e.entity),
  };
}
