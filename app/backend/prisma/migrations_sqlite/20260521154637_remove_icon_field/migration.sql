/*
  Warnings:

  - You are about to drop the column `icon` on the `AboutItem` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AboutItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_AboutItem" ("createdAt", "id", "orderIndex", "text", "updatedAt") SELECT "createdAt", "id", "orderIndex", "text", "updatedAt" FROM "AboutItem";
DROP TABLE "AboutItem";
ALTER TABLE "new_AboutItem" RENAME TO "AboutItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
