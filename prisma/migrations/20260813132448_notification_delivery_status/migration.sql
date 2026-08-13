-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "emailError" TEXT,
ADD COLUMN     "emailStatus" TEXT NOT NULL DEFAULT 'skipped',
ADD COLUMN     "smsError" TEXT,
ADD COLUMN     "smsStatus" TEXT NOT NULL DEFAULT 'skipped';
