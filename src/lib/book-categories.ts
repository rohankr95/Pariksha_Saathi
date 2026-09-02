import type { BookCategory } from "@prisma/client";

export const BOOK_CATEGORY_LABEL: Record<BookCategory, string> = {
  NCERT: "NCERT",
  SCERT_CGBSE: "SCERT / CGBSE छत्तीसगढ़",
  REFERENCE: "संदर्भ पुस्तकें",
  COMPETITIVE: "प्रतियोगी परीक्षा",
  PREVIOUS_YEAR_PAPER: "पिछले वर्ष के प्रश्नपत्र",
  MODEL_ANSWER: "मॉडल उत्तर पत्र",
};
