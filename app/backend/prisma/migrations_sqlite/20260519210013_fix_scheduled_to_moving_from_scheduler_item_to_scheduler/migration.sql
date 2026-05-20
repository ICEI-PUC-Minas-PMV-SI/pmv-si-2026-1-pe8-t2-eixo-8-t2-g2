/*
  Warnings:

  - You are about to drop the column `scheduledTo` on the `SchedulerItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Scheduler" ADD COLUMN "scheduledTo" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SchedulerItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schedulerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "priceAtBooking" REAL,
    "durationMinutes" INTEGER,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SchedulerItem_schedulerId_fkey" FOREIGN KEY ("schedulerId") REFERENCES "Scheduler" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SchedulerItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SchedulerItem" ("createdAt", "durationMinutes", "id", "orderIndex", "priceAtBooking", "productId", "quantity", "schedulerId") SELECT "createdAt", "durationMinutes", "id", "orderIndex", "priceAtBooking", "productId", "quantity", "schedulerId" FROM "SchedulerItem";
DROP TABLE "SchedulerItem";
ALTER TABLE "new_SchedulerItem" RENAME TO "SchedulerItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
