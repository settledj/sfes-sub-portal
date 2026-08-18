-- Self-service "forgot password" reset link support.
ALTER TABLE "allowed_users" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "allowed_users" ADD COLUMN "resetTokenExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "allowed_users_resetToken_key" ON "allowed_users"("resetToken");
