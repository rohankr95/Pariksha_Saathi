import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveUpload } from "@/lib/storage";

const MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 15 * 1024 * 1024;

const KIND_RULES: Record<string, { folder: string; allowedRoles: string[] }> = {
  "answer-copy": { folder: "answer-copies", allowedRoles: ["STUDENT"] },
  "answer-copy-checked": { folder: "answer-copies/checked", allowedRoles: ["TEACHER", "SUPER_ADMIN"] },
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "अनधिकृत / Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const kind = formData.get("kind");
  const file = formData.get("file");

  if (typeof kind !== "string" || !(kind in KIND_RULES)) {
    return NextResponse.json({ error: "Invalid upload kind" }, { status: 400 });
  }
  const rule = KIND_RULES[kind];
  if (!rule.allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "अनधिकृत / Unauthorized" }, { status: 401 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "केवल PDF, JPG या PNG फाइलें स्वीकार्य हैं" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `फाइल का आकार ${Math.round(MAX_BYTES / 1024 / 1024)}MB से कम होना चाहिए` }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await saveUpload({ buffer, originalName: file.name }, rule.folder);

  return NextResponse.json(stored);
}
