import Image from "next/image";

/**
 * District mark — cropped from the official Surajpur logo (public/brand/logo.png:
 * sun, fort, and birds, minus the "SURAJPUR" wordmark, which doesn't read at
 * this size). Regenerate public/brand/logo-icon.png and the favicon/PWA icon
 * set from the same crop if the source logo is ever replaced.
 */
export function Emblem({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/logo-icon.png"
      alt=""
      width={64}
      height={64}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}
