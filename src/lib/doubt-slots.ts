import { prisma } from "@/lib/prisma";
import type { BookingMode } from "@prisma/client";

export type OpenSlot = {
  start: Date;
  end: Date;
  capacity: number;
  bookedCount: number;
  mode: BookingMode;
  meetingLink: string | null;
};

const DAYS_AHEAD = 21;
const MIN_NOTICE_MIN = 30; // don't offer a slot starting sooner than this

/** Computes bookable slots for a teacher: weekly rules minus blackout dates minus existing bookings minus the past. */
export async function getOpenSlots(teacherId: string): Promise<OpenSlot[]> {
  const now = new Date();
  const until = new Date(now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000);
  const earliestBookable = new Date(now.getTime() + MIN_NOTICE_MIN * 60 * 1000);

  const [rules, exceptions, bookings] = await Promise.all([
    prisma.teacherAvailability.findMany({ where: { teacherId } }),
    prisma.availabilityException.findMany({ where: { teacherId, isBlocked: true } }),
    prisma.doubtBooking.findMany({
      where: { teacherId, status: "BOOKED", slotStart: { gte: now, lte: until } },
      select: { slotStart: true },
    }),
  ]);

  const blockedDates = new Set(exceptions.map((e) => e.date.toDateString()));
  const bookedCountBySlot = new Map<string, number>();
  for (const b of bookings) {
    const key = b.slotStart.toISOString();
    bookedCountBySlot.set(key, (bookedCountBySlot.get(key) ?? 0) + 1);
  }

  const slots: OpenSlot[] = [];

  for (let d = 0; d <= DAYS_AHEAD; d++) {
    const day = new Date(now);
    day.setDate(day.getDate() + d);
    day.setHours(0, 0, 0, 0);
    if (blockedDates.has(day.toDateString())) continue;

    const weekday = day.getDay();
    const rulesForDay = rules.filter(
      (r) =>
        r.weekday === weekday &&
        (!r.validFrom || day >= new Date(r.validFrom.toDateString())) &&
        (!r.validTo || day <= new Date(r.validTo.toDateString()))
    );

    for (const rule of rulesForDay) {
      const [sh, sm] = rule.startTime.split(":").map(Number);
      const [eh, em] = rule.endTime.split(":").map(Number);
      const ruleEnd = new Date(day);
      ruleEnd.setHours(eh, em, 0, 0);

      let slotStart = new Date(day);
      slotStart.setHours(sh, sm, 0, 0);

      while (slotStart.getTime() + rule.slotMinutes * 60000 <= ruleEnd.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + rule.slotMinutes * 60000);
        if (slotStart >= earliestBookable) {
          const bookedCount = bookedCountBySlot.get(slotStart.toISOString()) ?? 0;
          if (bookedCount < rule.capacity) {
            slots.push({
              start: new Date(slotStart),
              end: slotEnd,
              capacity: rule.capacity,
              bookedCount,
              mode: rule.mode,
              meetingLink: rule.meetingLink,
            });
          }
        }
        slotStart = slotEnd;
      }
    }
  }

  slots.sort((a, b) => a.start.getTime() - b.start.getTime());
  return slots;
}

/** Groups slots by calendar day (IST) for a day-picker UI. */
export function groupSlotsByDay(slots: OpenSlot[]): Map<string, OpenSlot[]> {
  const map = new Map<string, OpenSlot[]>();
  for (const slot of slots) {
    const key = slot.start.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(slot);
  }
  return map;
}
