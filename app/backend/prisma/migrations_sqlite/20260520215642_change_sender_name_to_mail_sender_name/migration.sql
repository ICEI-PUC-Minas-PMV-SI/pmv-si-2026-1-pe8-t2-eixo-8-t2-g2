/*
  Warnings:

  - You are about to drop the column `senderName` on the `GoogleIntegration` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GoogleIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "googleEmail" TEXT,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "encryptedRefreshToken" TEXT,
    "tokenType" TEXT,
    "scopes" TEXT NOT NULL,
    "mailFrom" TEXT,
    "mailSenderName" TEXT,
    "useForCalendar" BOOLEAN NOT NULL DEFAULT false,
    "useForEmail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_GoogleIntegration" ("clientId", "clientSecret", "createdAt", "encryptedRefreshToken", "googleEmail", "id", "mailFrom", "scopes", "tokenType", "updatedAt", "useForCalendar", "useForEmail") SELECT "clientId", "clientSecret", "createdAt", "encryptedRefreshToken", "googleEmail", "id", "mailFrom", "scopes", "tokenType", "updatedAt", "useForCalendar", "useForEmail" FROM "GoogleIntegration";
DROP TABLE "GoogleIntegration";
ALTER TABLE "new_GoogleIntegration" RENAME TO "GoogleIntegration";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
