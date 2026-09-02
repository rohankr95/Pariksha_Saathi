import Link from "next/link";
import { PlayCircle, MessageCircleQuestion, CalendarClock, FileCheck2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

type Props = {
  continueLecture: { lecture: { id: string; title: string } } | null;
  nextBooking: { slotStart: Date; teacher: { name: string } } | null;
  nearestExam: { name: string; applyEnd: Date | null } | null;
  pendingAnswerCopy: { paperName: string; status: string } | null;
};

function StripCard({
  icon: Icon,
  label,
  value,
  href,
  colorVar,
}: {
  icon: typeof PlayCircle;
  label: string;
  value: string;
  href: string;
  colorVar: string;
}) {
  return (
    <Link href={href}>
      <Card className="flex h-full items-center gap-3 p-4 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
          style={{
            backgroundColor: `color-mix(in srgb, var(${colorVar}) 15%, transparent)`,
            color: `var(${colorVar})`,
          }}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-sm font-semibold text-foreground">{value}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Card>
    </Link>
  );
}

export function PersonalisedStrip({ continueLecture, nextBooking, nearestExam, pendingAnswerCopy }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StripCard
        icon={PlayCircle}
        label="जारी रखें"
        value={continueLecture ? continueLecture.lecture.title : "व्याख्यान देखना शुरू करें"}
        href={continueLecture ? `/lectures/${continueLecture.lecture.id}` : "/lectures"}
        colorVar="--color-section-lectures"
      />
      <StripCard
        icon={MessageCircleQuestion}
        label="अगली शंका कक्षा"
        value={
          nextBooking
            ? `${nextBooking.teacher.name} · ${new Date(nextBooking.slotStart).toLocaleString("hi-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}`
            : "अभी कोई बुकिंग नहीं"
        }
        href="/doubt-class"
        colorVar="--color-section-doubtclass"
      />
      <StripCard
        icon={CalendarClock}
        label="निकटतम परीक्षा तिथि"
        value={
          nearestExam
            ? `${nearestExam.name}${nearestExam.applyEnd ? ` · ${new Date(nearestExam.applyEnd).toLocaleDateString("hi-IN", { day: "numeric", month: "short" })}` : ""}`
            : "कोई सूचना नहीं"
        }
        href="/exam-dates"
        colorVar="--color-section-examdates"
      />
      <StripCard
        icon={FileCheck2}
        label="उत्तरपुस्तिका स्थिति"
        value={pendingAnswerCopy ? `${pendingAnswerCopy.paperName} · ${pendingAnswerCopy.status}` : "कोई सबमिशन नहीं"}
        href="/answer-copies"
        colorVar="--color-section-answercopies"
      />
    </div>
  );
}
