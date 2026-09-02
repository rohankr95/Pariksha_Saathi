import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveUpload } from "@/lib/storage";

const KIND_RULES: Record<string, { folder: string; maxBytes: number; mimeTypes: string[] }> = {
  "note-file": { folder: "notes", maxBytes: 20 * 1024 * 1024, mimeTypes: ["application/pdf"] },
  "book-file": { folder: "books/files", maxBytes: 30 * 1024 * 1024, mimeTypes: ["application/pdf"] },
  "book-cover": {
    folder: "books/covers",
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
  },
  "story-photo": {
    folder: "stories",
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
  },
  "exam-notification": { folder: "exams", maxBytes: 10 * 1024 * 1024, mimeTypes: ["application/pdf"] },
  "olympiad-syllabus": { folder: "olympiads", maxBytes: 10 * 1024 * 1024, mimeTypes: ["application/pdf"] },
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "अनधिकृत / Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const kind = formData.get("kind");
  const file = formData.get("file");

  if (typeof kind !== "string" || !(kind in KIND_RULES)) {
    return NextResponse.json({ error: "Invalid upload kind" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const rule = KIND_RULES[kind];
  if (!rule.mimeTypes.includes(file.type)) {
    return NextResponse.json(
      { error: `केवल ${rule.mimeTypes.join(", ")} फाइलें स्वीकार्य हैं` },
      { status: 400 }
    );
  }
  if (file.size > rule.maxBytes) {
    return NextResponse.json(
      { error: `फाइल का आकार ${Math.round(rule.maxBytes / 1024 / 1024)}MB से कम होना चाहिए` },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await saveUpload({ buffer, originalName: file.name }, rule.folder);

  return NextResponse.json(stored);
}
