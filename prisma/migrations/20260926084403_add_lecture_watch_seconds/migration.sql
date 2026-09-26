-- AlterTable
ALTER TABLE "LectureWatchProgress" ADD COLUMN     "watchedSeconds" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "LectureWatchProgress_updatedAt_idx" ON "LectureWatchProgress"("updatedAt");
