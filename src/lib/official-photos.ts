import fs from "node:fs";
import path from "node:path";

const OFFICIALS_DIR = path.join(process.cwd(), "public", "brand", "officials");
const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export type OfficialKey = "collector" | "deo";

/**
 * Looks for public/brand/officials/<key>.(jpg|jpeg|png|webp) and returns its
 * public URL, or null if no photo has been supplied yet — callers fall back
 * to a generic avatar icon in that case.
 */
export function getOfficialPhotoUrl(key: OfficialKey): string | null {
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(path.join(OFFICIALS_DIR, `${key}.${ext}`))) {
      return `/brand/officials/${key}.${ext}`;
    }
  }
  return null;
}
