-- CreateTable
CREATE TABLE "Topper" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "fatherName" TEXT,
    "motherName" TEXT,
    "school" TEXT NOT NULL,
    "block" TEXT,
    "classLevel" "ClassLevel" NOT NULL,
    "examYear" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION,
    "rank" INTEGER,
    "photoUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topper_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Topper_isPublished_idx" ON "Topper"("isPublished");

-- CreateIndex
CREATE INDEX "Topper_examYear_idx" ON "Topper"("examYear");
