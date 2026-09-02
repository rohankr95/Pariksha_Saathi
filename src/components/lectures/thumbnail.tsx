"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayCircle } from "lucide-react";

export function LectureThumbnail({ src, alt = "" }: { src: string | null; alt?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <PlayCircle className="h-10 w-10" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}
