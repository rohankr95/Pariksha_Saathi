-- CreateTable
CREATE TABLE "AnonLectureWatch" (
    "id" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "visitorKey" TEXT NOT NULL,
    "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnonLectureWatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnonLectureWatch_lectureId_idx" ON "AnonLectureWatch"("lectureId");

-- CreateIndex
CREATE UNIQUE INDEX "AnonLectureWatch_lectureId_visitorKey_key" ON "AnonLectureWatch"("lectureId", "visitorKey");
