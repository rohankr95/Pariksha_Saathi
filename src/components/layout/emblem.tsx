/**
 * Placeholder district/state emblem mark. Replace the asset at
 * /public/emblem.svg with the official Chhattisgarh Government + district
 * emblem artwork supplied by the department before going live.
 */
export function Emblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="var(--primary)" />
      <circle cx="24" cy="24" r="22" fill="none" stroke="var(--accent)" strokeWidth="2" />
      <path
        d="M24 12l3.2 6.6 7.3.9-5.3 5.1 1.3 7.3-6.5-3.5-6.5 3.5 1.3-7.3-5.3-5.1 7.3-.9L24 12z"
        fill="var(--primary-foreground)"
      />
    </svg>
  );
}
