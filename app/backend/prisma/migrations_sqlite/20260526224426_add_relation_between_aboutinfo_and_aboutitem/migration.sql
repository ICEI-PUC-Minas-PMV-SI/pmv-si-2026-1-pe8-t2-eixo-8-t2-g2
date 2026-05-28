/*
  Warnings:

  - Added the required column `aboutId` to the `AboutItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AboutItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "aboutId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AboutItem_aboutId_fkey" FOREIGN KEY ("aboutId") REFERENCES "AboutInfo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AboutItem" ("createdAt", "id", "orderIndex", "text", "updatedAt") SELECT "createdAt", "id", "orderIndex", "text", "updatedAt" FROM "AboutItem";
DROP TABLE "AboutItem";
ALTER TABLE "new_AboutItem" RENAME TO "AboutItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
