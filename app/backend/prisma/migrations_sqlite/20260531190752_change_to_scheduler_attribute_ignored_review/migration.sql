/*
  Warnings:

  - You are about to drop the column `ignored` on the `Review` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schedulerId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_schedulerId_fkey" FOREIGN KEY ("schedulerId") REFERENCES "Scheduler" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("comment", "createdAt", "customerId", "featured", "id", "rating", "schedulerId", "updatedAt") SELECT "comment", "createdAt", "customerId", "featured", "id", "rating", "schedulerId", "updatedAt" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE UNIQUE INDEX "Review_schedulerId_key" ON "Review"("schedulerId");
CREATE INDEX "Review_customerId_idx" ON "Review"("customerId");
CREATE INDEX "Review_featured_idx" ON "Review"("featured");
CREATE TABLE "new_Scheduler" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "scheduledTo" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT NOT NULL,
    "deliveryType" TEXT NOT NULL,
    "cancellationReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "googleEventId" TEXT,
    "ignoredReview" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Scheduler_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Scheduler" ("cancellationReason", "createdAt", "customerId", "deliveryType", "googleEventId", "id", "paymentMethod", "scheduledAt", "scheduledTo", "status", "updatedAt") SELECT "cancellationReason", "createdAt", "customerId", "deliveryType", "googleEventId", "id", "paymentMethod", "scheduledAt", "scheduledTo", "status", "updatedAt" FROM "Scheduler";
DROP TABLE "Scheduler";
ALTER TABLE "new_Scheduler" RENAME TO "Scheduler";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
