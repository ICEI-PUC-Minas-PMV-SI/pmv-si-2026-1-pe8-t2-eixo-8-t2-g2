-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductCategory" ("categoryId", "createdAt", "id", "productId") SELECT "categoryId", "createdAt", "id", "productId" FROM "ProductCategory";
DROP TABLE "ProductCategory";
ALTER TABLE "new_ProductCategory" RENAME TO "ProductCategory";
CREATE INDEX "ProductCategory_categoryId_idx" ON "ProductCategory"("categoryId");
CREATE INDEX "ProductCategory_productId_idx" ON "ProductCategory"("productId");
CREATE UNIQUE INDEX "ProductCategory_productId_categoryId_key" ON "ProductCategory"("productId", "categoryId");
CREATE TABLE "new_ProductCharacteristic" (
    "productId" TEXT NOT NULL,
    "characteristicId" TEXT NOT NULL,

    PRIMARY KEY ("productId", "characteristicId"),
    CONSTRAINT "ProductCharacteristic_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductCharacteristic_characteristicId_fkey" FOREIGN KEY ("characteristicId") REFERENCES "Characteristic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductCharacteristic" ("characteristicId", "productId") SELECT "characteristicId", "productId" FROM "ProductCharacteristic";
DROP TABLE "ProductCharacteristic";
ALTER TABLE "new_ProductCharacteristic" RENAME TO "ProductCharacteristic";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
