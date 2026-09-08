/**
 * District mark, styled after the Surajpur district identity (rising sun +
 * fort silhouette over a green field). Swap this for the department's
 * official vector artwork if one is supplied later — keep the same 0 0 48 48
 * viewBox and legibility at 32-40px so header/footer/PWA usages don't shift.
 */
export function Emblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="var(--ps-green-600)" />
      <circle cx="24" cy="24" r="22" fill="none" stroke="var(--ps-green-500)" strokeWidth="1.5" />

      {/* rising sun */}
      <g stroke="var(--ps-saffron-400)" strokeWidth="2" strokeLinecap="round">
        <line x1="24" y1="8.5" x2="24" y2="12" />
        <line x1="15.5" y1="12" x2="17.7" y2="14.6" />
        <line x1="32.5" y1="12" x2="30.3" y2="14.6" />
        <line x1="10.5" y1="18" x2="13.6" y2="18.9" />
        <line x1="37.5" y1="18" x2="34.4" y2="18.9" />
      </g>
      <circle cx="24" cy="20" r="6.5" fill="var(--ps-saffron-500)" />

      {/* fort silhouette */}
      <path
        d="M12 34v-7.5h3v-3h3v3h4.5v-5l1.5-1.5 1.5 1.5v5H30v-3h3v3h3V34z"
        fill="var(--ps-coral-600)"
      />
      <rect x="10.5" y="34" width="27" height="2.6" rx="1" fill="var(--ps-coral-600)" />
      <rect x="23.2" y="16.5" width="1.6" height="4" fill="var(--ps-coral-600)" />
    </svg>
  );
}
