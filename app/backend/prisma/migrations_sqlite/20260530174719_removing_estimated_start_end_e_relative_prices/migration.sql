/*
  Warnings:

  - You are about to drop the column `bookingLeadDays` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `bookingLeadTimeMinutes` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedMaxPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedMinPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedEndAt` on the `Scheduler` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedStartAt` on the `Scheduler` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL DEFAULT 0,
    "bookingLeadMinutes" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Product" ("createdAt", "description", "id", "isActive", "name", "price", "slug") SELECT "createdAt", "description", "id", "isActive", "name", "price", "slug" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");
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
    CONSTRAINT "Scheduler_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Scheduler" ("cancellationReason", "createdAt", "customerId", "deliveryType", "googleEventId", "id", "paymentMethod", "scheduledAt", "scheduledTo", "status", "updatedAt") SELECT "cancellationReason", "createdAt", "customerId", "deliveryType", "googleEventId", "id", "paymentMethod", "scheduledAt", "scheduledTo", "status", "updatedAt" FROM "Scheduler";
DROP TABLE "Scheduler";
ALTER TABLE "new_Scheduler" RENAME TO "Scheduler";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
