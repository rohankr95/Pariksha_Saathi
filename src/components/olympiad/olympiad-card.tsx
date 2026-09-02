import { ExternalLink, FileText, Medal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InterestButton } from "@/components/olympiad/interest-button";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { formatIST } from "@/lib/exam-status";
import { getT } from "@/lib/i18n/server";
import type { ClassLevel } from "@prisma/client";

type OlympiadCardData = {
  id: string;
  name: string;
  body: string;
  eligibleClasses: ClassLevel[];
  regStart: Date | null;
  regEnd: Date | null;
  fee: string | null;
  pattern: string | null;
  officialUrl: string | null;
  syllabusUrl: string | null;
  previousPapersUrl: string | null;
};

export async function OlympiadCard({
  olympiad,
  isStudent,
  interested,
}: {
  olympiad: OlympiadCardData;
  isStudent: boolean;
  interested: boolean;
}) {
  const t = await getT();

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-olympiad)]/15 text-[var(--color-section-olympiad)]">
          <Medal className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{olympiad.name}</p>
          <p className="text-xs text-muted-foreground">{olympiad.body}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {olympiad.eligibleClasses.map((c) => (
              <Badge key={c} variant="outline" className="text-[10px]">
                {CLASS_LEVEL_LABEL[c]}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
        <div>
          {t("olympiad.card.registration")}
          {formatIST(olympiad.regStart)} – {formatIST(olympiad.regEnd)}
          {olympiad.fee ? t("olympiad.card.fee", { fee: olympiad.fee }) : ""}
        </div>
        {olympiad.pattern && <div>{t("olympiad.card.pattern", { pattern: olympiad.pattern })}</div>}
      </dl>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {olympiad.syllabusUrl && (
          <a href={olympiad.syllabusUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <FileText className="h-3.5 w-3.5" /> {t("olympiad.card.syllabus")}
          </a>
        )}
        {olympiad.previousPapersUrl && (
          <a href={olympiad.previousPapersUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <FileText className="h-3.5 w-3.5" /> {t("olympiad.card.previousPapers")}
          </a>
        )}
        {olympiad.officialUrl && (
          <a href={olympiad.officialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <ExternalLink className="h-3.5 w-3.5" /> {t("olympiad.card.officialSite")}
          </a>
        )}
        {isStudent && (
          <span className="ml-auto">
            <InterestButton olympiadId={olympiad.id} initialInterested={interested} />
          </span>
        )}
      </div>
    </Card>
  );
}

export type { OlympiadCardData };
