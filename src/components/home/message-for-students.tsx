"use client";

import Image from "next/image";
import { UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { OfficialKey } from "@/lib/official-photos";

const OFFICIALS: OfficialKey[] = ["collector", "deo"];

/**
 * Renders each official's photo from public/brand/officials/<key>.* when
 * supplied (see getOfficialPhotoUrl), falling back to a generic avatar icon.
 */
export function MessageForStudents({ photos }: { photos: Record<OfficialKey, string | null> }) {
  const { t } = useLocale();

  return (
    <section>
      <h2 className="mb-4 font-sans text-xl font-bold text-foreground sm:text-2xl">
        {t("home.messageForStudentsTitle")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {OFFICIALS.map((key) => {
          const photo = photos[key];
          return (
            <Card key={key}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row">
                <div className="flex shrink-0 flex-col items-center gap-2 sm:w-32">
                  {photo ? (
                    <span className="relative h-20 w-20 overflow-hidden rounded-full">
                      <Image src={photo} alt="" fill sizes="80px" className="object-cover" />
                    </span>
                  ) : (
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-primary">
                      <UserRound className="h-10 w-10" aria-hidden="true" />
                    </span>
                  )}
                  <p className="text-center text-xs font-semibold text-foreground">
                    {t(`home.officials.${key}.role`)}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`home.officials.${key}.message`)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
