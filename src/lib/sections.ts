import {
  PlayCircle,
  BookOpen,
  Library,
  Trophy,
  CalendarClock,
  Compass,
  HandHelping,
  MessageCircleQuestion,
  Medal,
  Lightbulb,
  Crown,
  FileCheck2,
  type LucideIcon,
} from "lucide-react";

export type SectionKey =
  | "lectures"
  | "notes"
  | "books"
  | "stories"
  | "examDates"
  | "career"
  | "classRequest"
  | "doubtClass"
  | "olympiad"
  | "quiz"
  | "leaderboard"
  | "answerCopies";

export type SectionDef = {
  key: SectionKey;
  href: string;
  icon: LucideIcon;
  colorVar: string; // CSS var name, e.g. --color-section-lectures
};

export const SECTIONS: SectionDef[] = [
  { key: "lectures", href: "/lectures", icon: PlayCircle, colorVar: "--color-section-lectures" },
  { key: "notes", href: "/notes", icon: BookOpen, colorVar: "--color-section-notes" },
  { key: "books", href: "/books", icon: Library, colorVar: "--color-section-books" },
  { key: "stories", href: "/stories", icon: Trophy, colorVar: "--color-section-stories" },
  { key: "examDates", href: "/exam-dates", icon: CalendarClock, colorVar: "--color-section-examdates" },
  { key: "career", href: "/career", icon: Compass, colorVar: "--color-section-career" },
  { key: "classRequest", href: "/class-request", icon: HandHelping, colorVar: "--color-section-classrequest" },
  { key: "doubtClass", href: "/doubt-class", icon: MessageCircleQuestion, colorVar: "--color-section-doubtclass" },
  { key: "olympiad", href: "/olympiad", icon: Medal, colorVar: "--color-section-olympiad" },
  { key: "quiz", href: "/quiz", icon: Lightbulb, colorVar: "--color-section-quiz" },
  { key: "leaderboard", href: "/leaderboard", icon: Crown, colorVar: "--color-section-leaderboard" },
  { key: "answerCopies", href: "/answer-copies", icon: FileCheck2, colorVar: "--color-section-answercopies" },
];
