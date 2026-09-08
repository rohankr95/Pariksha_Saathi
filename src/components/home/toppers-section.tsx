import Image from "next/image";
import { UserRound, Medal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getT } from "@/lib/i18n/server";
import type { Topper, ClassLevel } from "@prisma/client";

const CLASS_NUMBER: Record<ClassLevel, string> = {
  CLASS_9: "9",
  CLASS_10: "10",
  CLASS_11: "11",
  CLASS_12: "12",
};

export async function ToppersSection({ toppers }: { toppers: Topper[] }) {
  if (toppers.length === 0) return null;
  const t = await getT();
  const year = toppers[0].examYear;

  return (
    <section>
      <div className="mb-5 text-center sm:text-left">
        <h2 className="font-sans text-xl font-bold text-foreground sm:text-2xl">
          {t("toppers.public.sectionTitle", { year })}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("toppers.public.sectionSubtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {toppers.map((topper) => (
          <Card
            key={topper.id}
            className="overflow-hidden text-center transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[var(--ps-saffron-400)] via-accent to-[var(--ps-saffron-400)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-accent-foreground">
              <Medal className="h-3.5 w-3.5" aria-hidden="true" />
              {topper.rank ? t("toppers.public.rankBadge", { rank: topper.rank }) : t("toppers.public.classAndYear", { class: CLASS_NUMBER[topper.classLevel], year: topper.examYear })}
            </div>

            <div className="flex flex-col items-center gap-2 p-4">
              <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-md border-4 border-[color-mix(in_srgb,var(--accent)_35%,transparent)] shadow-[var(--shadow-card)] sm:h-36 sm:w-28">
                {topper.photoUrl ? (
                  <Image src={topper.photoUrl} alt="" fill sizes="140px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-muted text-muted-foreground">
                    <UserRound className="h-10 w-10" aria-hidden="true" />
                  </div>
                )}
              </div>

              <p className="font-sans text-sm font-bold text-foreground sm:text-base">
                {topper.studentName}
              </p>

              {(topper.fatherName || topper.motherName) && (
                <p className="text-[11px] leading-snug text-muted-foreground">
                  {topper.fatherName && `${t("toppers.public.father")}: ${topper.fatherName}`}
                  {topper.fatherName && topper.motherName && " · "}
                  {topper.motherName && `${t("toppers.public.mother")}: ${topper.motherName}`}
                </p>
              )}

              <p className="text-xs font-medium text-primary">{topper.school}</p>

              <p className="text-[11px] text-muted-foreground">
                {t("toppers.public.classAndYear", {
                  class: CLASS_NUMBER[topper.classLevel],
                  year: topper.examYear,
                })}
              </p>

              {topper.percentage != null && (
                <span className="mt-1 inline-block rounded-full bg-success/15 px-3 py-1 text-sm font-bold text-success">
                  {topper.percentage}%
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
