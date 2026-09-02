import type { AnswerCopyStatus } from "@prisma/client";

export const ANSWER_COPY_STATUS_LABEL: Record<AnswerCopyStatus, string> = {
  SUBMITTED: "जमा किया गया",
  ASSIGNED: "आबंटित",
  UNDER_EVALUATION: "मूल्यांकन जारी",
  CHECKED: "जांचा गया",
  RETURNED: "वापस भेजा गया",
};

export const ANSWER_COPY_STATUS_COLOR: Record<AnswerCopyStatus, string> = {
  SUBMITTED: "--muted-foreground",
  ASSIGNED: "--color-section-examdates",
  UNDER_EVALUATION: "--color-section-doubtclass",
  CHECKED: "--success",
  RETURNED: "--success",
};

export const ANSWER_COPY_WEEKLY_LIMIT = 3;
