"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BOOKING_MODE_LABEL } from "@/lib/weekday";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_COLOR } from "@/lib/doubt-booking-status";
import { cancelBooking, markBookingOutcome } from "@/app/doubt-class/actions";
import type { BookingMode, BookingStatus } from "@prisma/client";

type Booking = {
  id: string;
  slotStart: Date;
  topic: string;
  description: string | null;
  mode: BookingMode;
  meetingLink: string | null;
  status: BookingStatus;
  teacherNotes: string | null;
  student: { name: string; classLevel: string | null; mobile: string | null };
};

function formatWhen(d: Date) {
  return new Intl.DateTimeFormat("hi-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{
        backgroundColor: `color-mix(in srgb, var(${BOOKING_STATUS_COLOR[status]}) 15%, transparent)`,
        color: `var(${BOOKING_STATUS_COLOR[status]})`,
      }}
    >
      {BOOKING_STATUS_LABEL[status]}
    </span>
  );
}

function UpcomingCard({ booking }: { booking: Booking }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);

  function doCancel() {
    if (!reason.trim()) {
      setError("रद्द करने का कारण आवश्यक है");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await cancelBooking(booking.id, reason);
      } catch (e) {
        setError(e instanceof Error ? e.message : "रद्द नहीं हो सका");
      }
    });
  }

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{booking.topic}</p>
          <p className="text-xs text-muted-foreground">
            {booking.student.name} · कक्षा {booking.student.classLevel ?? "—"} · {booking.student.mobile ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatWhen(booking.slotStart)} · {BOOKING_MODE_LABEL[booking.mode]}
          </p>
          {booking.description && <p className="mt-1 text-xs text-muted-foreground">{booking.description}</p>}
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {!showCancel ? (
        <div className="mt-3 border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={() => setShowCancel(true)}>
            रद्द करें
          </Button>
        </div>
      ) : (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="रद्द करने का कारण" />
          {error && <p className="text-xs text-[var(--color-section-examdates)]">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" disabled={pending} onClick={doCancel}>
              पुष्टि करें
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowCancel(false)}>
              वापस
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function PastCard({ booking }: { booking: Booking }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"ATTENDED" | "NO_SHOW">(booking.status === "NO_SHOW" ? "NO_SHOW" : "ATTENDED");
  const [notes, setNotes] = useState(booking.teacherNotes ?? "");
  const isFinal = booking.status === "ATTENDED" || booking.status === "NO_SHOW" || booking.status === "CANCELLED";

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{booking.topic}</p>
          <p className="text-xs text-muted-foreground">
            {booking.student.name} · {formatWhen(booking.slotStart)}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {booking.status !== "CANCELLED" && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <Select value={status} onChange={(e) => setStatus(e.target.value as "ATTENDED" | "NO_SHOW")} className="max-w-[140px]">
            <option value="ATTENDED">उपस्थित</option>
            <option value="NO_SHOW">अनुपस्थित</option>
          </Select>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="टिप्पणी (वैकल्पिक)" className="max-w-xs flex-1" />
          <Button
            size="sm"
            disabled={pending}
            onClick={() => startTransition(() => markBookingOutcome(booking.id, status, notes))}
          >
            {isFinal ? "अद्यतन करें" : "दर्ज करें"}
          </Button>
        </div>
      )}
    </Card>
  );
}

export function TeacherBookingsList({ upcoming, past }: { upcoming: Booking[]; past: Booking[] }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-3 font-sans text-lg font-semibold text-foreground">आगामी कक्षाएँ</h2>
        <div className="space-y-3">
          {upcoming.length === 0 && <p className="text-sm text-muted-foreground">कोई आगामी कक्षा नहीं है।</p>}
          {upcoming.map((b) => (
            <UpcomingCard key={b.id} booking={b} />
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-3 font-sans text-lg font-semibold text-foreground">पूर्व कक्षाएँ</h2>
        <div className="space-y-3">
          {past.length === 0 && <p className="text-sm text-muted-foreground">अभी कोई पूर्व कक्षा नहीं है।</p>}
          {past.map((b) => (
            <PastCard key={b.id} booking={b} />
          ))}
        </div>
      </div>
    </div>
  );
}
