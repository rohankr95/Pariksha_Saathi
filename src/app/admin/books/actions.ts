"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";

const bookSchema = z
  .object({
    title: z.string().min(3).max(200),
    category: z.enum(["NCERT", "SCERT_CGBSE", "REFERENCE", "COMPETITIVE", "PREVIOUS_YEAR_PAPER", "MODEL_ANSWER"]),
    classLevel: z.enum(["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"]),
    subjectId: z.string().optional(),
    board: z.string().max(100).optional(),
    medium: z.enum(["HINDI", "ENGLISH", "CHHATTISGARHI"]),
    edition: z.string().max(50).optional(),
    coverUrl: z.string().optional(),
    fileUrl: z.string().optional(),
    fileSizeBytes: z.coerce.number().int().min(0).optional(),
    sourceUrl: z.string().optional(),
    copyrightCleared: z.literal(true, {
      error: "कॉपीराइट/स्रोत स्पष्टता की पुष्टि आवश्यक है",
    }),
  })
  .refine((data) => data.fileUrl || data.sourceUrl, {
    message: "फाइल अपलोड करें या स्रोत URL दें",
    path: ["sourceUrl"],
  });

function parseForm(formData: FormData) {
  return bookSchema.parse({
    title: formData.get("title"),
    category: formData.get("category"),
    classLevel: formData.get("classLevel"),
    subjectId: formData.get("subjectId") || undefined,
    board: formData.get("board") || undefined,
    medium: formData.get("medium"),
    edition: formData.get("edition") || undefined,
    coverUrl: formData.get("coverUrl") || undefined,
    fileUrl: formData.get("fileUrl") || undefined,
    fileSizeBytes: formData.get("fileSizeBytes") || undefined,
    sourceUrl: formData.get("sourceUrl") || undefined,
    copyrightCleared: formData.get("copyrightCleared") === "on",
  });
}

export async function createBook(formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  const book = await prisma.book.create({
    data: { ...data, subjectId: data.subjectId || null, isPublished: formData.get("isPublished") === "on" },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Book", entityId: book.id });
  revalidatePath("/admin/books");
  revalidatePath("/books");
  redirect("/admin/books");
}

export async function updateBook(id: string, formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = parseForm(formData);

  await prisma.book.update({
    where: { id },
    data: { ...data, subjectId: data.subjectId || null, isPublished: formData.get("isPublished") === "on" },
  });

  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Book", entityId: id });
  revalidatePath("/admin/books");
  revalidatePath("/books");
  redirect("/admin/books");
}

export async function deleteBook(id: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.book.update({ where: { id }, data: { deletedAt: new Date(), isPublished: false } });
  await logAudit({ userId: session.user.id, action: "DELETE", entity: "Book", entityId: id });
  revalidatePath("/admin/books");
  revalidatePath("/books");
}

export async function toggleBookPublish(id: string, next: boolean) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.book.update({ where: { id }, data: { isPublished: next } });
  await logAudit({
    userId: session.user.id,
    action: next ? "PUBLISH" : "UNPUBLISH",
    entity: "Book",
    entityId: id,
  });
  revalidatePath("/admin/books");
  revalidatePath("/books");
}
