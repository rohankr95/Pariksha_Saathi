"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BOOKING_MODE_LABEL } from "@/lib/weekday";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_COLOR } from "@/lib/doubt-booking-status";
import { cancelBooking, rateBooking } from "@/app/doubt-class/actions";
import type { BookingMode, BookingStatus } from "@prisma/client";

type Booking = {
  id: string;
  slotStart: Date;
  topic: string;
  mode: BookingMode;
  meetingLink: string | null;
  status: BookingStatus;
  rating: number | null;
  teacher: { name: string };
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

function BookingCard({ booking }: { booking: Booking }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(booking.rating ?? 0);

  function doCancel() {
    if (!window.confirm("क्या आप वाकई इस बुकिंग को रद्द करना चाहते हैं?")) return;
    setError(null);
    startTransition(async () => {
      try {
        await cancelBooking(booking.id, "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "रद्द नहीं हो सका");
      }
    });
  }

  function doRate(value: number) {
    setRating(value);
    startTransition(() => rateBooking(booking.id, value));
  }

  const canCancel = booking.status === "BOOKED";
  const canRate = booking.status === "ATTENDED";

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{booking.topic}</p>
          <p className="text-xs text-muted-foreground">
            {booking.teacher.name} · {formatWhen(booking.slotStart)}
          </p>
          <p className="text-xs text-muted-foreground">{BOOKING_MODE_LABEL[booking.mode]}</p>
          {booking.meetingLink && booking.status === "BOOKED" && (
            <a href={booking.meetingLink} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary hover:underline">
              मीटिंग लिंक खोलें
            </a>
          )}
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{
            backgroundColor: `color-mix(in srgb, var(${BOOKING_STATUS_COLOR[booking.status]}) 15%, transparent)`,
            color: `var(${BOOKING_STATUS_COLOR[booking.status]})`,
          }}
        >
          {BOOKING_STATUS_LABEL[booking.status]}
        </span>
      </div>

      {canRate && (
        <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
          <span className="mr-1 text-xs text-muted-foreground">रेटिंग:</span>
          {[1, 2, 3, 4, 5].map((v) => (
            <button key={v} onClick={() => doRate(v)} disabled={pending} aria-label={`${v} स्टार`}>
              <Star className={v <= rating ? "h-4 w-4 fill-[var(--color-section-leaderboard)] text-[var(--color-section-leaderboard)]" : "h-4 w-4 text-border"} />
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-[var(--color-section-examdates)]">{error}</p>}

      {canCancel && (
        <div className="mt-3 border-t border-border pt-3">
          <Button variant="outline" size="sm" disabled={pending} onClick={doCancel}>
            रद्द करें
          </Button>
        </div>
      )}
    </Card>
  );
}

export function StudentBookingsList({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} />
      ))}
    </div>
  );
}
