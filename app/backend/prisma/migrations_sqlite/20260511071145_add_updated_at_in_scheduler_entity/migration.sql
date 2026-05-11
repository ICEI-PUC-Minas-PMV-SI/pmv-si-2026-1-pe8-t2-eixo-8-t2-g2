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
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Scheduler_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Scheduler" ("cancellationReason", "createdAt", "customerId", "deliveryType", "estimatedEndAt", "estimatedStartAt", "id", "paymentMethod", "scheduledAt", "status") SELECT "cancellationReason", "createdAt", "customerId", "deliveryType", "estimatedEndAt", "estimatedStartAt", "id", "paymentMethod", "scheduledAt", "status" FROM "Scheduler";
DROP TABLE "Scheduler";
ALTER TABLE "new_Scheduler" RENAME TO "Scheduler";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
