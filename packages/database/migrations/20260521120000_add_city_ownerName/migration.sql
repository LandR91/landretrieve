-- AlterTable: add city to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "city" TEXT;

-- AlterTable: add ownerName to AgencyProfile
ALTER TABLE "AgencyProfile" ADD COLUMN IF NOT EXISTS "ownerName" TEXT;
