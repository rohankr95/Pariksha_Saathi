-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ClassLevel" AS ENUM ('CLASS_9', 'CLASS_10', 'CLASS_11', 'CLASS_12');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('HINDI', 'ENGLISH', 'CHHATTISGARHI');

-- CreateEnum
CREATE TYPE "BookCategory" AS ENUM ('NCERT', 'SCERT_CGBSE', 'REFERENCE', 'COMPETITIVE', 'PREVIOUS_YEAR_PAPER', 'MODEL_ANSWER');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('UPCOMING', 'ONGOING', 'CLOSED');

-- CreateEnum
CREATE TYPE "ClassRequestStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'SCHEDULED', 'COMPLETED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ClassRequestMode" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "BookingMode" AS ENUM ('MEET', 'PHONE', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('BOOKED', 'CANCELLED', 'RESCHEDULED', 'ATTENDED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ_SINGLE', 'MCQ_MULTIPLE', 'TRUE_FALSE', 'ASSERTION_REASON', 'NUMERIC');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "AnswerCopyStatus" AS ENUM ('SUBMITTED', 'ASSIGNED', 'UNDER_EVALUATION', 'CHECKED', 'RETURNED');

-- CreateEnum
CREATE TYPE "LeaderboardPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'ALL_TIME');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "classLevel" "ClassLevel",
    "stream" TEXT,
    "school" TEXT,
    "block" TEXT,
    "displayName" TEXT,
    "avatarKey" TEXT,
    "onLeaderboard" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "lastActiveAt" TIMESTAMP(3),
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "StudentStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "nameHi" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "classLevel" "ClassLevel" NOT NULL,
    "icon" TEXT,
    "colorKey" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "nameHi" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "classLevel" "ClassLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lecture" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "youtubeUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "durationSec" INTEGER,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT,
    "classLevel" "ClassLevel" NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "language" "Language" NOT NULL DEFAULT 'HINDI',
    "playlistId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LectureWatchProgress" (
    "id" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LectureWatchProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokenLinkReport" (
    "id" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "reporterId" TEXT,
    "note" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrokenLinkReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT,
    "classLevel" "ClassLevel" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'HINDI',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteVersion" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "BookCategory" NOT NULL,
    "classLevel" "ClassLevel" NOT NULL,
    "subjectId" TEXT,
    "board" TEXT,
    "medium" "Language" NOT NULL DEFAULT 'HINDI',
    "coverUrl" TEXT,
    "fileUrl" TEXT,
    "sourceUrl" TEXT,
    "edition" TEXT,
    "fileSizeBytes" INTEGER,
    "copyrightCleared" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "designation" TEXT,
    "photoUrl" TEXT,
    "videoUrl" TEXT,
    "body" TEXT,
    "district" TEXT,
    "block" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isSubmission" BOOLEAN NOT NULL DEFAULT false,
    "submittedById" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "applyStart" TIMESTAMP(3),
    "applyEnd" TIMESTAMP(3),
    "examDate" TIMESTAMP(3),
    "resultDate" TIMESTAMP(3),
    "officialUrl" TEXT,
    "notificationUrl" TEXT,
    "classes" "ClassLevel"[],
    "status" "ExamStatus" NOT NULL DEFAULT 'UPCOMING',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "reminderSent7d" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent1d" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerRoadmap" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "stream" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "eligibility" TEXT,
    "stepsJson" JSONB NOT NULL,
    "exams" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "institutesJson" JSONB,
    "salaryRange" TEXT,
    "scholarships" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerRoadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "chapter" TEXT,
    "classLevel" "ClassLevel" NOT NULL,
    "preferredTeacherId" TEXT,
    "mode" "ClassRequestMode" NOT NULL DEFAULT 'ONLINE',
    "preferredTime" TEXT,
    "description" TEXT,
    "urgency" TEXT NOT NULL DEFAULT 'normal',
    "status" "ClassRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "adminRemark" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherAvailability" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotMinutes" INTEGER NOT NULL DEFAULT 30,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "mode" "BookingMode" NOT NULL DEFAULT 'MEET',
    "meetingLink" TEXT,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityException" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,

    CONSTRAINT "AvailabilityException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoubtBooking" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "slotStart" TIMESTAMP(3) NOT NULL,
    "slotEnd" TIMESTAMP(3) NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "attachmentUrl" TEXT,
    "mode" "BookingMode" NOT NULL DEFAULT 'MEET',
    "meetingLink" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'BOOKED',
    "cancelReason" TEXT,
    "rating" INTEGER,
    "teacherNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoubtBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Olympiad" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "eligibleClasses" "ClassLevel"[],
    "syllabusUrl" TEXT,
    "regStart" TIMESTAMP(3),
    "regEnd" TIMESTAMP(3),
    "fee" TEXT,
    "pattern" TEXT,
    "officialUrl" TEXT,
    "previousPapersUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Olympiad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OlympiadInterest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "olympiadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OlympiadInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT,
    "classLevel" "ClassLevel" NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "timeLimitMin" INTEGER NOT NULL DEFAULT 20,
    "marksPerQ" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "negativeMarks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "maxAttempts" INTEGER NOT NULL DEFAULT 1,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL DEFAULT 'MCQ_SINGLE',
    "textHi" TEXT NOT NULL,
    "textEn" TEXT,
    "imageUrl" TEXT,
    "optionsJson" JSONB,
    "correctAnswer" JSONB NOT NULL,
    "explanation" TEXT,
    "marks" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "timeTakenSec" INTEGER,
    "answersJson" JSONB,
    "tabSwitches" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerCopy" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "classLevel" "ClassLevel" NOT NULL,
    "paperName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "AnswerCopyStatus" NOT NULL DEFAULT 'SUBMITTED',
    "marksAwarded" DOUBLE PRECISION,
    "totalMarks" DOUBLE PRECISION,
    "remarks" TEXT,
    "checkedFileUrl" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedAt" TIMESTAMP(3),

    CONSTRAINT "AnswerCopy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardStat" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "period" "LeaderboardPeriod" NOT NULL,
    "subjectId" TEXT,
    "totalPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgTimeSec" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "textHi" TEXT NOT NULL,
    "textEn" TEXT,
    "link" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metaJson" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TeacherSubjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TeacherSubjects_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_classLevel_idx" ON "User"("classLevel");

-- CreateIndex
CREATE INDEX "User_school_idx" ON "User"("school");

-- CreateIndex
CREATE INDEX "User_block_idx" ON "User"("block");

-- CreateIndex
CREATE UNIQUE INDEX "StudentStreak_userId_key" ON "StudentStreak"("userId");

-- CreateIndex
CREATE INDEX "Subject_classLevel_idx" ON "Subject"("classLevel");

-- CreateIndex
CREATE INDEX "Chapter_subjectId_idx" ON "Chapter"("subjectId");

-- CreateIndex
CREATE INDEX "Lecture_subjectId_idx" ON "Lecture"("subjectId");

-- CreateIndex
CREATE INDEX "Lecture_chapterId_idx" ON "Lecture"("chapterId");

-- CreateIndex
CREATE INDEX "Lecture_classLevel_idx" ON "Lecture"("classLevel");

-- CreateIndex
CREATE INDEX "Lecture_isPublished_idx" ON "Lecture"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "LectureWatchProgress_lectureId_userId_key" ON "LectureWatchProgress"("lectureId", "userId");

-- CreateIndex
CREATE INDEX "Note_subjectId_idx" ON "Note"("subjectId");

-- CreateIndex
CREATE INDEX "Note_chapterId_idx" ON "Note"("chapterId");

-- CreateIndex
CREATE INDEX "Note_classLevel_idx" ON "Note"("classLevel");

-- CreateIndex
CREATE INDEX "Note_isPublished_idx" ON "Note"("isPublished");

-- CreateIndex
CREATE INDEX "Book_classLevel_idx" ON "Book"("classLevel");

-- CreateIndex
CREATE INDEX "Book_category_idx" ON "Book"("category");

-- CreateIndex
CREATE INDEX "Story_isPublished_idx" ON "Story"("isPublished");

-- CreateIndex
CREATE INDEX "Story_isFeatured_idx" ON "Story"("isFeatured");

-- CreateIndex
CREATE INDEX "Exam_status_idx" ON "Exam"("status");

-- CreateIndex
CREATE INDEX "Exam_applyEnd_idx" ON "Exam"("applyEnd");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSubscription_userId_examId_key" ON "ExamSubscription"("userId", "examId");

-- CreateIndex
CREATE INDEX "CareerRoadmap_isPublished_idx" ON "CareerRoadmap"("isPublished");

-- CreateIndex
CREATE INDEX "ClassRequest_status_idx" ON "ClassRequest"("status");

-- CreateIndex
CREATE INDEX "ClassRequest_subjectId_idx" ON "ClassRequest"("subjectId");

-- CreateIndex
CREATE INDEX "TeacherAvailability_teacherId_idx" ON "TeacherAvailability"("teacherId");

-- CreateIndex
CREATE INDEX "AvailabilityException_teacherId_date_idx" ON "AvailabilityException"("teacherId", "date");

-- CreateIndex
CREATE INDEX "DoubtBooking_studentId_idx" ON "DoubtBooking"("studentId");

-- CreateIndex
CREATE INDEX "DoubtBooking_status_idx" ON "DoubtBooking"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DoubtBooking_teacherId_slotStart_key" ON "DoubtBooking"("teacherId", "slotStart");

-- CreateIndex
CREATE INDEX "Olympiad_isPublished_idx" ON "Olympiad"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "OlympiadInterest_studentId_olympiadId_key" ON "OlympiadInterest"("studentId", "olympiadId");

-- CreateIndex
CREATE INDEX "Quiz_subjectId_idx" ON "Quiz"("subjectId");

-- CreateIndex
CREATE INDEX "Quiz_classLevel_idx" ON "Quiz"("classLevel");

-- CreateIndex
CREATE INDEX "Quiz_isPublished_idx" ON "Quiz"("isPublished");

-- CreateIndex
CREATE INDEX "Question_quizId_idx" ON "Question"("quizId");

-- CreateIndex
CREATE INDEX "QuizAttempt_quizId_idx" ON "QuizAttempt"("quizId");

-- CreateIndex
CREATE INDEX "QuizAttempt_studentId_idx" ON "QuizAttempt"("studentId");

-- CreateIndex
CREATE INDEX "AnswerCopy_studentId_idx" ON "AnswerCopy"("studentId");

-- CreateIndex
CREATE INDEX "AnswerCopy_teacherId_idx" ON "AnswerCopy"("teacherId");

-- CreateIndex
CREATE INDEX "AnswerCopy_status_idx" ON "AnswerCopy"("status");

-- CreateIndex
CREATE INDEX "LeaderboardStat_period_subjectId_idx" ON "LeaderboardStat"("period", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardStat_studentId_period_subjectId_key" ON "LeaderboardStat"("studentId", "period", "subjectId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "_TeacherSubjects_B_index" ON "_TeacherSubjects"("B");

-- AddForeignKey
ALTER TABLE "StudentStreak" ADD CONSTRAINT "StudentStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureWatchProgress" ADD CONSTRAINT "LectureWatchProgress_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokenLinkReport" ADD CONSTRAINT "BrokenLinkReport_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteVersion" ADD CONSTRAINT "NoteVersion_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubscription" ADD CONSTRAINT "ExamSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubscription" ADD CONSTRAINT "ExamSubscription_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassRequest" ADD CONSTRAINT "ClassRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassRequest" ADD CONSTRAINT "ClassRequest_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassRequest" ADD CONSTRAINT "ClassRequest_preferredTeacherId_fkey" FOREIGN KEY ("preferredTeacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAvailability" ADD CONSTRAINT "TeacherAvailability_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityException" ADD CONSTRAINT "AvailabilityException_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtBooking" ADD CONSTRAINT "DoubtBooking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtBooking" ADD CONSTRAINT "DoubtBooking_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OlympiadInterest" ADD CONSTRAINT "OlympiadInterest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OlympiadInterest" ADD CONSTRAINT "OlympiadInterest_olympiadId_fkey" FOREIGN KEY ("olympiadId") REFERENCES "Olympiad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerCopy" ADD CONSTRAINT "AnswerCopy_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerCopy" ADD CONSTRAINT "AnswerCopy_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerCopy" ADD CONSTRAINT "AnswerCopy_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeacherSubjects" ADD CONSTRAINT "_TeacherSubjects_A_fkey" FOREIGN KEY ("A") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeacherSubjects" ADD CONSTRAINT "_TeacherSubjects_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
