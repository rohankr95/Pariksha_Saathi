import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await prisma.note.findFirst({ where: { id, isPublished: true, deletedAt: null } });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.note.update({ where: { id }, data: { downloads: { increment: 1 } } });

  return NextResponse.redirect(new URL(note.fileUrl, _req.url));
}
