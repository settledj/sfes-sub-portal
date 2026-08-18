-- Teacher/substitute-initiated cancellations now require admin approval.
ALTER TABLE "requests" ADD COLUMN "cancelRequestedAt" TIMESTAMP(3);
ALTER TABLE "requests" ADD COLUMN "cancelRequestedBy" "AllowedRole";
