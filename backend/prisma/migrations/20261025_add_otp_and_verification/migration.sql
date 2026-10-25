-- AlterTable: Add phoneVerified and emailVerified to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: otp_requests
CREATE TABLE IF NOT EXISTS "otp_requests" (
    "id" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "otp_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "otp_requests_target_purpose_consumedAt_idx" ON "otp_requests"("target", "purpose", "consumedAt");
CREATE INDEX IF NOT EXISTS "otp_requests_expiresAt_idx" ON "otp_requests"("expiresAt");
CREATE INDEX IF NOT EXISTS "otp_requests_createdAt_idx" ON "otp_requests"("createdAt");
