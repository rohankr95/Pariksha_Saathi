-- Allow multiple students to share a group-capacity doubt-class slot.
-- Old constraint blocked ANY second booking at (teacherId, slotStart);
-- capacity enforcement now happens inside a Serializable transaction at
-- booking time (see src/app/doubt-class/actions.ts).
DROP INDEX IF EXISTS "DoubtBooking_teacherId_slotStart_key";

CREATE UNIQUE INDEX "DoubtBooking_teacherId_slotStart_studentId_key"
  ON "DoubtBooking"("teacherId", "slotStart", "studentId");

CREATE INDEX "DoubtBooking_teacherId_slotStart_idx"
  ON "DoubtBooking"("teacherId", "slotStart");
