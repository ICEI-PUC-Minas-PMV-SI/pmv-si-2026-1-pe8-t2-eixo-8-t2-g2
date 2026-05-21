/*
  Warnings:

  - You are about to drop the column `aboutId` on the `AboutItem` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AboutItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "icon" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_AboutItem" ("createdAt", "icon", "id", "text", "updatedAt") SELECT "createdAt", "icon", "id", "text", "updatedAt" FROM "AboutItem";
DROP TABLE "AboutItem";
ALTER TABLE "new_AboutItem" RENAME TO "AboutItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
