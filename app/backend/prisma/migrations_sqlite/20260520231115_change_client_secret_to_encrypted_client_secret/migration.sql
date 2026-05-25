/*
  Warnings:

  - You are about to drop the column `clientSecret` on the `GoogleIntegration` table. All the data in the column will be lost.
  - Added the required column `encryptedClientSecret` to the `GoogleIntegration` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GoogleIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "googleEmail" TEXT,
    "clientId" TEXT NOT NULL,
    "encryptedClientSecret" TEXT NOT NULL,
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
INSERT INTO "new_GoogleIntegration" ("clientId", "createdAt", "encryptedRefreshToken", "googleEmail", "id", "mailFrom", "mailSenderName", "scopes", "tokenType", "updatedAt", "useForCalendar", "useForEmail") SELECT "clientId", "createdAt", "encryptedRefreshToken", "googleEmail", "id", "mailFrom", "mailSenderName", "scopes", "tokenType", "updatedAt", "useForCalendar", "useForEmail" FROM "GoogleIntegration";
DROP TABLE "GoogleIntegration";
ALTER TABLE "new_GoogleIntegration" RENAME TO "GoogleIntegration";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
