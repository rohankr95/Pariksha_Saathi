import {
  LayoutDashboard,
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
  Users,
  Megaphone,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  slug: string;
  href: string;
  titleHi: string;
  titleEn: string;
  icon: LucideIcon;
  phase: string;
  roles: ("TEACHER" | "SUPER_ADMIN")[];
};

export const ADMIN_NAV: AdminNavItem[] = [
  { slug: "dashboard", href: "/admin", titleHi: "डैशबोर्ड", titleEn: "Dashboard", icon: LayoutDashboard, phase: "Phase 1", roles: ["TEACHER", "SUPER_ADMIN"] },
  { slug: "lectures", href: "/admin/lectures", titleHi: "व्याख्यान", titleEn: "Lectures", icon: PlayCircle, phase: "Phase 2", roles: ["TEACHER", "SUPER_ADMIN"] },
  { slug: "notes", href: "/admin/notes", titleHi: "नोट्स", titleEn: "Notes", icon: BookOpen, phase: "Phase 2", roles: ["TEACHER", "SUPER_ADMIN"] },
  { slug: "books", href: "/admin/books", titleHi: "पुस्तकें", titleEn: "Books", icon: Library, phase: "Phase 2", roles: ["TEACHER", "SUPER_ADMIN"] },
  { slug: "stories", href: "/admin/stories", titleHi: "प्रेरक कहानियाँ", titleEn: "Motivational Stories", icon: Trophy, phase: "Phase 2", roles: ["TEACHER", "SUPER_ADMIN"] },
  { slug: "exam-dates", href: "/admin/exam-dates", titleHi: "परीक्षा तिथि", titleEn: "Exam Dates", icon: CalendarClock, phase: "Phase 3", roles: ["TEACHER", "SUPER_ADMIN"] },
  { slug: "career-roadmaps", href: "/admin/career-roadmaps", titleHi: "करियर रोडमैप", titleEn: "Career Roadmaps", icon: Compass, phase: "Phase 3", roles: ["TEACHER", "SUPER_ADMIN"] },
  { slug: "olympiads", href: "/admin/olympiads", titleHi: "ओलंपियाड", titleEn: "Olympiads", icon: Medal, phase: "Phase 3", roles: ["TEACHER", "SUPER_ADMIN"] },
  { slug: "quizzes", href: "/admin/quizzes", titleHi: "प्रश्नोत्तरी", titleEn: "Quizzes", icon: Lightbulb, phase: "Phase 4", roles: ["TEACHER", "SUPER_ADMIN"] },
  { slug: "leaderboard", href: "/admin/leaderboard", titleHi: "शीर्ष प्रदर्शन", titleEn: "Leaderboard", icon: Crown, phase: "Phase 4", roles: ["TEACHER", "SUPER_ADMIN"] },
  { slug: "class-requests", href: "/admin/class-requests", titleHi: "कक्षा अनुरोध", titleEn: "Class Requests", icon: HandHelping, phase: "Phase 5", roles: ["TEACHER", "SUPER_ADMIN"] },
  { slug: "doubt-classes", href: "/admin/doubt-classes", titleHi: "शंका समाधान", titleEn: "Doubt Classes", icon: MessageCircleQuestion, phase: "Phase 5", roles: ["TEACHER", "SUPER_ADMIN"] },
  { slug: "answer-copies", href: "/admin/answer-copies", titleHi: "उत्तरपुस्तिका जाँच", titleEn: "Answer Copy Checking", icon: FileCheck2, phase: "Phase 5", roles: ["TEACHER", "SUPER_ADMIN"] },
  { slug: "teachers", href: "/admin/teachers", titleHi: "शिक्षक प्रबंधन", titleEn: "Teacher Management", icon: Users, phase: "Phase 6", roles: ["SUPER_ADMIN"] },
  { slug: "announcements", href: "/admin/announcements", titleHi: "सूचना पट्ट", titleEn: "Announcements", icon: Megaphone, phase: "Phase 6", roles: ["TEACHER", "SUPER_ADMIN"] },
  { slug: "audit-log", href: "/admin/audit-log", titleHi: "ऑडिट लॉग", titleEn: "Audit Log", icon: ScrollText, phase: "Phase 6", roles: ["SUPER_ADMIN"] },
];
