const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Formats a "YYYY-MM-DD" key as "D Mon" without going through Intl —
 * toLocaleDateString output can differ between Node's ICU data and the
 * browser's for non-"en-US" locales, which is a real class of
 * server/client hydration mismatch. This is deterministic everywhere.
 */
export function formatShortDate(dateKey: string): string {
  const [, month, day] = dateKey.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]}`;
}

/** "9 Nov 2026", or for a weekly bucket keyed by its Monday, "3 Nov – 9 Nov 2026". */
export function formatPeriod(dateKey: string, weekly: boolean): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!weekly) return `${day} ${MONTHS[month - 1]} ${year}`;
  const end = new Date(Date.UTC(year, month - 1, day + 6));
  return `${day} ${MONTHS[month - 1]} – ${end.getUTCDate()} ${MONTHS[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
}
