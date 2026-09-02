import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { mimeForExt } from "@/lib/mime";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Reject traversal attempts before touching the filesystem.
  if (segments.some((s) => s.includes("..") || s.includes("\0"))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const baseDir = path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    process.env.LOCAL_UPLOAD_DIR || "./uploads"
  );
  const filePath = path.resolve(/* turbopackIgnore: true */ baseDir, ...segments);

  if (!filePath.startsWith(baseDir + path.sep)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) throw new Error("not a file");
    const buffer = await readFile(filePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeForExt(path.extname(filePath)),
        "Content-Length": String(stats.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
