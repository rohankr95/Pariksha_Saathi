import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export type UploadInput = {
  buffer: Buffer;
  originalName: string;
};

export type StoredFile = {
  /** Storage-relative path, persisted on the record (e.g. Note.fileUrl). */
  path: string;
  /** Public URL the browser can fetch. */
  url: string;
  sizeBytes: number;
};

function driver() {
  return process.env.STORAGE_DRIVER === "s3" ? "s3" : "local";
}

function safeExt(originalName: string) {
  const ext = path.extname(originalName).toLowerCase();
  return /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : "";
}

/** Uploads a file under `folder` (e.g. "notes", "books/covers") and returns where it landed. */
export async function saveUpload(file: UploadInput, folder: string): Promise<StoredFile> {
  const filename = `${randomUUID()}${safeExt(file.originalName)}`;
  const relPath = `${folder}/${filename}`;

  if (driver() === "s3") {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
      },
    });
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: relPath,
        Body: file.buffer,
      })
    );
    const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "") || "";
    return { path: relPath, url: `${base}/${relPath}`, sizeBytes: file.buffer.byteLength };
  }

  const baseDir = process.env.LOCAL_UPLOAD_DIR || "./uploads";
  const absDir = path.join(/* turbopackIgnore: true */ process.cwd(), baseDir, folder);
  await mkdir(absDir, { recursive: true });
  await writeFile(path.join(/* turbopackIgnore: true */ absDir, filename), file.buffer);
  return { path: relPath, url: `/api/files/${relPath}`, sizeBytes: file.buffer.byteLength };
}

export async function deleteUpload(relPath: string): Promise<void> {
  if (driver() === "s3") {
    const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
      },
    });
    await client.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: relPath }));
    return;
  }
  const baseDir = process.env.LOCAL_UPLOAD_DIR || "./uploads";
  try {
    await unlink(path.join(/* turbopackIgnore: true */ process.cwd(), baseDir, relPath));
  } catch {
    // already gone — fine
  }
}
