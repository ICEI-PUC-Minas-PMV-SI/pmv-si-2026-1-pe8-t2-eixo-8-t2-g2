/*
  Warnings:

  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProfessionalAvailability` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `professionalId` on the `Scheduler` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `SchedulerItem` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Activity";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProfessionalAvailability";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Scheduler" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "estimatedStartAt" DATETIME,
    "estimatedEndAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Scheduler_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Scheduler" ("createdAt", "customerId", "estimatedEndAt", "estimatedStartAt", "id", "scheduledAt", "status") SELECT "createdAt", "customerId", "estimatedEndAt", "estimatedStartAt", "id", "scheduledAt", "status" FROM "Scheduler";
DROP TABLE "Scheduler";
ALTER TABLE "new_Scheduler" RENAME TO "Scheduler";
CREATE TABLE "new_SchedulerItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schedulerId" TEXT NOT NULL,
    "productId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "priceAtBooking" REAL,
    "durationMinutes" INTEGER,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SchedulerItem_schedulerId_fkey" FOREIGN KEY ("schedulerId") REFERENCES "Scheduler" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SchedulerItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SchedulerItem" ("createdAt", "durationMinutes", "id", "orderIndex", "priceAtBooking", "productId", "quantity", "schedulerId") SELECT "createdAt", "durationMinutes", "id", "orderIndex", "priceAtBooking", "productId", "quantity", "schedulerId" FROM "SchedulerItem";
DROP TABLE "SchedulerItem";
ALTER TABLE "new_SchedulerItem" RENAME TO "SchedulerItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
