-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecoveryCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codeHash" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" DATETIME,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecoveryCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    CONSTRAINT "Scheduler_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Scheduler" ("cancellationReason", "createdAt", "customerId", "deliveryType", "estimatedEndAt", "estimatedStartAt", "id", "paymentMethod", "scheduledAt", "status") SELECT "cancellationReason", "createdAt", "customerId", "deliveryType", "estimatedEndAt", "estimatedStartAt", "id", "paymentMethod", "scheduledAt", "status" FROM "Scheduler";
DROP TABLE "Scheduler";
ALTER TABLE "new_Scheduler" RENAME TO "Scheduler";
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

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "RecoveryCode_userId_idx" ON "RecoveryCode"("userId");
