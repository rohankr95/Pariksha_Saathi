import Image from "next/image";

/**
 * Both variants are crops of the official public/brand/logo.png (only
 * transparent padding trimmed, no content removed) — "icon" additionally
 * drops the "SURAJPUR" wordmark since it isn't legible at square-icon sizes
 * (admin sidebar). Regenerate both, plus the favicon/PWA icon set, from the
 * same source if the logo is ever replaced.
 */
const VARIANTS = {
  icon: { src: "/brand/logo-icon.png", width: 512, height: 512 },
  full: { src: "/brand/logo-full.png", width: 1536, height: 678 },
} as const;

export function Emblem({
  className,
  variant = "icon",
}: {
  className?: string;
  variant?: keyof typeof VARIANTS;
}) {
  const { src, width, height } = VARIANTS[variant];
  return (
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}
