-- Add notification preference fields to admins, mirroring teachers/substitutes.
ALTER TABLE "admins" ADD COLUMN "notifyBookingUpdates" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "admins" ADD COLUMN "notifyMessages" BOOLEAN NOT NULL DEFAULT true;
