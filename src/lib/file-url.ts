/**
 * Turns a stored file reference into a browser-usable href.
 *
 * New uploads store the servable URL that saveUpload() returns (e.g.
 * "/api/files/answer-copies/x.pdf" for local storage, or an absolute S3 URL).
 * Older answer-copy records stored only the storage-relative path
 * ("answer-copies/x.pdf"); rendered as a bare href that resolves against the
 * current page and 404s, so prefix the local file route when the value isn't
 * already an absolute path or URL. Client-safe (no server-only imports).
 */
export function resolveFileHref(stored: string | null | undefined): string {
  if (!stored) return "";
  if (/^(https?:)?\/\//.test(stored) || stored.startsWith("/")) return stored;
  return `/api/files/${stored.replace(/^\/+/, "")}`;
}
