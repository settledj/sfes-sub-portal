-- AlterTable
ALTER TABLE "substitutes" ADD COLUMN "notifyBookingUpdates" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "substitutes" ADD COLUMN "notifyMessages" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN "notifyBookingUpdates" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "teachers" ADD COLUMN "notifyMessages" BOOLEAN NOT NULL DEFAULT true;
