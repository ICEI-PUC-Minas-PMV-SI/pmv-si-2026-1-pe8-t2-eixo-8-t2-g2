-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL DEFAULT 0,
    "estimatedMinPrice" REAL NOT NULL DEFAULT 0,
    "estimatedMaxPrice" REAL NOT NULL DEFAULT 0,
    "bookingLeadTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "bookingLeadDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Product" ("createdAt", "description", "estimatedMaxPrice", "estimatedMinPrice", "id", "name", "price") SELECT "createdAt", "description", "estimatedMaxPrice", "estimatedMinPrice", "id", "name", "price" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
