/*
  Warnings:

  - Added the required column `deliveryType` to the `Scheduler` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Scheduler` table without a default value. This is not possible if the table is not empty.

*/
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
    "paymentMethod" TEXT NOT NULL,
    "deliveryType" TEXT NOT NULL,
    "cancellationReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Scheduler_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Scheduler" ("createdAt", "customerId", "estimatedEndAt", "estimatedStartAt", "id", "scheduledAt", "status") SELECT "createdAt", "customerId", "estimatedEndAt", "estimatedStartAt", "id", "scheduledAt", "status" FROM "Scheduler";
DROP TABLE "Scheduler";
ALTER TABLE "new_Scheduler" RENAME TO "Scheduler";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
