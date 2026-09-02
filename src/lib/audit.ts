import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function logAudit(params: {
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | "PUBLISH" | "UNPUBLISH";
  entity: string;
  entityId: string;
  meta?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      metaJson: params.meta as Prisma.InputJsonValue | undefined,
    },
  });
}
