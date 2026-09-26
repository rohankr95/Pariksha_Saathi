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
