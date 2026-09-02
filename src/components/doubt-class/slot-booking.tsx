"use client";

import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BOOKING_MODE_LABEL } from "@/lib/weekday";
import { bookSlot, type BookSlotState } from "@/app/doubt-class/actions";

type DaySlot = {
  startISO: string;
  label: string;
  capacity: number;
  bookedCount: number;
  mode: string;
};
type Day = { date: string; slots: DaySlot[] };

const initialState: BookSlotState = {};

function formatDayLabel(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00+05:30`);
  return new Intl.DateTimeFormat("hi-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(date);
}

export function SlotBooking({ teacherId, days }: { teacherId: string; days: Day[] }) {
  const [activeDay, setActiveDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<DaySlot | null>(null);
  const [state, formAction, pending] = useActionState(bookSlot, initialState);

  if (state.success) {
    return (
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <p className="font-semibold text-foreground">आपकी शंका समाधान कक्षा बुक हो गई है!</p>
        <p className="text-sm text-muted-foreground">विवरण आपके ईमेल पर भेज दिया गया है (कैलेंडर आमंत्रण सहित)।</p>
      </Card>
    );
  }

  if (days.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        इस शिक्षक के पास आगामी दिनों में कोई उपलब्ध स्लॉट नहीं है।
      </Card>
    );
  }

  const day = days[activeDay];

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((d, i) => (
          <button
            key={d.date}
            onClick={() => {
              setActiveDay(i);
              setSelectedSlot(null);
            }}
            className={cn(
              "shrink-0 rounded-[var(--radius-md)] border px-3 py-2 text-xs font-semibold",
              i === activeDay
                ? "border-[var(--color-section-doubtclass)] bg-[var(--color-section-doubtclass)]/10 text-[var(--color-section-doubtclass)]"
                : "border-border text-muted-foreground hover:bg-surface-muted"
            )}
          >
            {formatDayLabel(d.date)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {day.slots.map((s) => (
          <button
            key={s.startISO}
            onClick={() => setSelectedSlot(s)}
            className={cn(
              "rounded-[var(--radius-md)] border p-2 text-center text-sm font-medium",
              selectedSlot?.startISO === s.startISO
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-surface-muted"
            )}
          >
            {s.label}
            {s.capacity > 1 && (
              <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                {s.capacity - s.bookedCount} सीट शेष
              </span>
            )}
          </button>
        ))}
      </div>

      {selectedSlot && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              {formatDayLabel(day.date)}, {selectedSlot.label}
            </p>
            <Badge variant="outline">{BOOKING_MODE_LABEL[selectedSlot.mode]}</Badge>
          </div>
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="teacherId" value={teacherId} />
            <input type="hidden" name="slotStartISO" value={selectedSlot.startISO} />
            <div className="space-y-1.5">
              <Label htmlFor="topic">विषय / प्रश्न</Label>
              <Input id="topic" name="topic" required minLength={3} maxLength={150} placeholder="जैसे: त्रिकोणमिति के सूत्र समझना" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">विवरण (वैकल्पिक)</Label>
              <Textarea id="description" name="description" rows={3} maxLength={1000} placeholder="अपनी शंका विस्तार से लिखें" />
            </div>

            {state.error && (
              <p role="alert" className="text-sm text-[var(--color-section-examdates)]">
                {state.error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "बुक हो रहा है..." : "स्लॉट बुक करें"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
