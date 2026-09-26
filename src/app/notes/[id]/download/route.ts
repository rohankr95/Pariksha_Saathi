import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await prisma.note.findFirst({ where: { id, isPublished: true, deletedAt: null } });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.note.update({ where: { id }, data: { downloads: { increment: 1 } } });

  // Don't resolve against the request's own URL — behind a reverse proxy,
  // Next.js's standalone server reports its own internal bind address (e.g.
  // 0.0.0.0:3000) here, not the public domain, producing an unreachable
  // redirect. AUTH_URL is used rather than NEXT_PUBLIC_APP_URL because
  // NEXT_PUBLIC_* vars are inlined at build time — the Docker build stage
  // never sees the real domain, only the running container does — while
  // AUTH_URL is read at request time and is already required for self-hosted
  // deployments to work at all (see auth.config.ts's trustHost).
  const base = process.env.AUTH_URL || new URL(_req.url).origin;
  return NextResponse.redirect(new URL(note.fileUrl, base));
}
