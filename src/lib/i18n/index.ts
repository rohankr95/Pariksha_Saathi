import hiCore from "./dictionaries/hi.json";
import enCore from "./dictionaries/en.json";
import hiAdmin from "./dictionaries/modules/hi/admin.json";
import enAdmin from "./dictionaries/modules/en/admin.json";
import hiLectures from "./dictionaries/modules/hi/lectures.json";
import enLectures from "./dictionaries/modules/en/lectures.json";
import hiNotes from "./dictionaries/modules/hi/notes.json";
import enNotes from "./dictionaries/modules/en/notes.json";
import hiBooks from "./dictionaries/modules/hi/books.json";
import enBooks from "./dictionaries/modules/en/books.json";
import hiStories from "./dictionaries/modules/hi/stories.json";
import enStories from "./dictionaries/modules/en/stories.json";
import hiExamDates from "./dictionaries/modules/hi/examDates.json";
import enExamDates from "./dictionaries/modules/en/examDates.json";
import hiCareer from "./dictionaries/modules/hi/career.json";
import enCareer from "./dictionaries/modules/en/career.json";
import hiOlympiad from "./dictionaries/modules/hi/olympiad.json";
import enOlympiad from "./dictionaries/modules/en/olympiad.json";
import hiQuiz from "./dictionaries/modules/hi/quiz.json";
import enQuiz from "./dictionaries/modules/en/quiz.json";
import hiLeaderboard from "./dictionaries/modules/hi/leaderboard.json";
import enLeaderboard from "./dictionaries/modules/en/leaderboard.json";
import hiClassRequest from "./dictionaries/modules/hi/classRequest.json";
import enClassRequest from "./dictionaries/modules/en/classRequest.json";
import hiDoubtClass from "./dictionaries/modules/hi/doubtClass.json";
import enDoubtClass from "./dictionaries/modules/en/doubtClass.json";
import hiAnswerCopies from "./dictionaries/modules/hi/answerCopies.json";
import enAnswerCopies from "./dictionaries/modules/en/answerCopies.json";
import hiDashboard from "./dictionaries/modules/hi/dashboard.json";
import enDashboard from "./dictionaries/modules/en/dashboard.json";

export type Locale = "hi" | "en";
export const LOCALE_COOKIE = "ps_locale";
export const DEFAULT_LOCALE: Locale = "hi";

// Each content module owns its own dictionary file under dictionaries/modules/
// (namespaced by module name, e.g. t("lectures.title")) so they can be edited
// independently without merge conflicts; this file is the single place that
// wires them all together into the two locale objects below.
const hi = {
  ...hiCore,
  admin: hiAdmin,
  lectures: hiLectures,
  notes: hiNotes,
  books: hiBooks,
  stories: hiStories,
  examDates: hiExamDates,
  career: hiCareer,
  olympiad: hiOlympiad,
  quiz: hiQuiz,
  leaderboard: hiLeaderboard,
  classRequest: hiClassRequest,
  doubtClass: hiDoubtClass,
  answerCopies: hiAnswerCopies,
  dashboard: hiDashboard,
};
const en = {
  ...enCore,
  admin: enAdmin,
  lectures: enLectures,
  notes: enNotes,
  books: enBooks,
  stories: enStories,
  examDates: enExamDates,
  career: enCareer,
  olympiad: enOlympiad,
  quiz: enQuiz,
  leaderboard: enLeaderboard,
  classRequest: enClassRequest,
  doubtClass: enDoubtClass,
  answerCopies: enAnswerCopies,
  dashboard: enDashboard,
};

export const dictionaries = { hi, en } as const;

export type Dictionary = typeof hi;

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/** Translate a dotted key, e.g. t(dict, "home.greeting", { name: "Ravi" }) */
export function translate(
  dict: Dictionary,
  key: string,
  vars?: Record<string, string | number>
): string {
  const raw = getByPath(dict, key);
  let str = typeof raw === "string" ? raw : key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}
