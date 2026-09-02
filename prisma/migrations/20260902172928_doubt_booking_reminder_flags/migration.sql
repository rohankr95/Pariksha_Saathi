-- AlterTable
ALTER TABLE "DoubtBooking" ADD COLUMN     "reminderSent1h" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminderSent24h" BOOLEAN NOT NULL DEFAULT false;
