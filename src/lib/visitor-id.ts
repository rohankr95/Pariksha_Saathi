// A random, non-identifying id for an anonymous visitor, kept in localStorage.
// Shared by the traffic beacon and the lecture watch-time tracker so a guest's
// site visits and watch time use the same key. Contains no personal data.
const KEY = "ps_vid";

export function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const vid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID().replace(/-/g, "")
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(KEY, vid);
    return vid;
  } catch {
    return "";
  }
}
