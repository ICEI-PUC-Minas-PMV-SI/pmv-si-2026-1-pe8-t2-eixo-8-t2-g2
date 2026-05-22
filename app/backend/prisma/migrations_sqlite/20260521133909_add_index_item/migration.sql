-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AboutItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "icon" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_AboutItem" ("createdAt", "icon", "id", "text", "updatedAt") SELECT "createdAt", "icon", "id", "text", "updatedAt" FROM "AboutItem";
DROP TABLE "AboutItem";
ALTER TABLE "new_AboutItem" RENAME TO "AboutItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
