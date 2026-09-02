import type { ClassRequestStatus } from "@prisma/client";

export const CLASS_REQUEST_STATUS_LABEL: Record<ClassRequestStatus, string> = {
  SUBMITTED: "भेजा गया",
  UNDER_REVIEW: "समीक्षा में",
  ACCEPTED: "स्वीकृत",
  SCHEDULED: "निर्धारित",
  COMPLETED: "पूर्ण",
  DECLINED: "अस्वीकृत",
};

export const CLASS_REQUEST_STATUS_COLOR: Record<ClassRequestStatus, string> = {
  SUBMITTED: "--muted-foreground",
  UNDER_REVIEW: "--color-section-examdates",
  ACCEPTED: "--color-section-career",
  SCHEDULED: "--color-section-doubtclass",
  COMPLETED: "--success",
  DECLINED: "--color-section-examdates",
};
