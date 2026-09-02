import type { BookingStatus } from "@prisma/client";

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  BOOKED: "निर्धारित",
  CANCELLED: "रद्द",
  RESCHEDULED: "पुनर्निर्धारित",
  ATTENDED: "पूर्ण",
  NO_SHOW: "अनुपस्थित",
};

export const BOOKING_STATUS_COLOR: Record<BookingStatus, string> = {
  BOOKED: "--color-section-doubtclass",
  CANCELLED: "--muted-foreground",
  RESCHEDULED: "--color-section-examdates",
  ATTENDED: "--success",
  NO_SHOW: "--color-section-examdates",
};
