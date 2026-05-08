/*
  Warnings:

  - Added the required column `integration` to the `GoogleCredentials` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GoogleCredentials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "encryptedRefreshToken" TEXT NOT NULL,
    "encryptedAccessToken" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "integration" TEXT NOT NULL
);
INSERT INTO "new_GoogleCredentials" ("encryptedAccessToken", "encryptedRefreshToken", "id", "tokenId", "tokenType") SELECT "encryptedAccessToken", "encryptedRefreshToken", "id", "tokenId", "tokenType" FROM "GoogleCredentials";
DROP TABLE "GoogleCredentials";
ALTER TABLE "new_GoogleCredentials" RENAME TO "GoogleCredentials";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
