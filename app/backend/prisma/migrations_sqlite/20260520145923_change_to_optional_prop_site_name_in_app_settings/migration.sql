-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "siteName" TEXT,
    "logoUrl" TEXT,
    "whatsapp" TEXT,
    "contactEmail" TEXT,
    "serviceHours" TEXT,
    "address" TEXT,
    "instagram" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AppSettings" ("address", "contactEmail", "createdAt", "id", "instagram", "logoUrl", "primaryColor", "secondaryColor", "serviceHours", "siteName", "updatedAt", "whatsapp") SELECT "address", "contactEmail", "createdAt", "id", "instagram", "logoUrl", "primaryColor", "secondaryColor", "serviceHours", "siteName", "updatedAt", "whatsapp" FROM "AppSettings";
DROP TABLE "AppSettings";
ALTER TABLE "new_AppSettings" RENAME TO "AppSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
