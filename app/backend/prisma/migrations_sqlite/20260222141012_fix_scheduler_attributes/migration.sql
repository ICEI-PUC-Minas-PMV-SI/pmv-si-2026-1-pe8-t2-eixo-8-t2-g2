/*
  Warnings:

  - Made the column `orderIndex` on table `SchedulerItem` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SchedulerItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schedulerId" TEXT NOT NULL,
    "activityId" TEXT,
    "productId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "priceAtBooking" REAL,
    "durationMinutes" INTEGER,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SchedulerItem_schedulerId_fkey" FOREIGN KEY ("schedulerId") REFERENCES "Scheduler" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SchedulerItem_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SchedulerItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SchedulerItem" ("activityId", "createdAt", "durationMinutes", "id", "orderIndex", "priceAtBooking", "productId", "quantity", "schedulerId") SELECT "activityId", "createdAt", "durationMinutes", "id", "orderIndex", "priceAtBooking", "productId", "quantity", "schedulerId" FROM "SchedulerItem";
DROP TABLE "SchedulerItem";
ALTER TABLE "new_SchedulerItem" RENAME TO "SchedulerItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
