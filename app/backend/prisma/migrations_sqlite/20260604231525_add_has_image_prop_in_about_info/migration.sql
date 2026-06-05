-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AboutInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "main" TEXT NOT NULL,
    "complementary" TEXT NOT NULL,
    "hasImage" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_AboutInfo" ("complementary", "createdAt", "id", "main", "subtitle", "title", "updatedAt") SELECT "complementary", "createdAt", "id", "main", "subtitle", "title", "updatedAt" FROM "AboutInfo";
DROP TABLE "AboutInfo";
ALTER TABLE "new_AboutInfo" RENAME TO "AboutInfo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
