"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";
import { sendEmail, renderNotification } from "@/lib/email";
import { CLASS_REQUEST_STATUS_LABEL } from "@/lib/class-request-status";
import type { ClassRequestStatus } from "@prisma/client";

export async function updateClassRequestStatus(id: string, status: ClassRequestStatus, remark: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);

  const updated = await prisma.classRequest.update({
    where: { id },
    data: { status, adminRemark: remark || null },
    include: { student: true, subject: true },
  });

  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entity: "ClassRequest",
    entityId: id,
    meta: { status },
  });

  if (updated.student.email) {
    const { html, text } = renderNotification(
      `<p>नमस्ते ${updated.student.name},</p>
       <p>आपके अनुरोध — <strong>${updated.subject.nameHi}${updated.chapter ? ` (${updated.chapter})` : ""}</strong> — की स्थिति बदलकर
       <strong>${CLASS_REQUEST_STATUS_LABEL[status]}</strong> कर दी गई है।</p>
       ${remark ? `<p>टिप्पणी: ${remark}</p>` : ""}`,
      `आपके अनुरोध की स्थिति: ${CLASS_REQUEST_STATUS_LABEL[status]}${remark ? ` — ${remark}` : ""}`
    );
    await sendEmail({
      to: updated.student.email,
      subject: `परीक्षा साथी: कक्षा अनुरोध स्थिति अपडेट`,
      html,
      text,
    });
  }

  revalidatePath("/admin/class-requests");
  revalidatePath("/class-request");
}
