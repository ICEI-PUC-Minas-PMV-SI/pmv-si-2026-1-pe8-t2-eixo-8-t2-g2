-- AlterTable
ALTER TABLE "Scheduler" ADD COLUMN "googleEventId" TEXT;

-- CreateTable
CREATE TABLE "GoogleIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "googleEmail" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "encryptedRefreshToken" TEXT NOT NULL,
    "encryptedAccessToken" TEXT,
    "tokenType" TEXT,
    "scopes" TEXT NOT NULL,
    "mailFrom" TEXT,
    "senderName" TEXT,
    "useForCalendar" BOOLEAN NOT NULL DEFAULT false,
    "useForEmail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "siteName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "whatsapp" TEXT,
    "contactEmail" TEXT,
    "serviceHours" TEXT,
    "address" TEXT,
    "instagram" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
