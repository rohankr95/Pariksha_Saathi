import fs from "node:fs";
import path from "node:path";

const HERO_DIR = path.join(process.cwd(), "public", "brand", "hero");
const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;

/**
 * Home page banner photos, read from public/brand/hero/ at request time.
 * Drop any number of images there (any filenames) — they're picked up
 * automatically, sorted by filename, with no code changes needed. Returns
 * [] when the folder is empty or missing, so callers can fall back to a
 * non-photo hero.
 */
export function getHeroImages(): string[] {
  try {
    return fs
      .readdirSync(HERO_DIR)
      .filter((f) => IMAGE_EXT.test(f))
      .sort()
      .map((f) => `/brand/hero/${f}`);
  } catch {
    return [];
  }
}
