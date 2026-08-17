-- AlterTable
ALTER TABLE "requests" ADD COLUMN "respondToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "requests_respondToken_key" ON "requests"("respondToken");
