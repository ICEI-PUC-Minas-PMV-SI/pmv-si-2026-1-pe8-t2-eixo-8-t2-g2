/*
  Warnings:

  - A unique constraint covering the columns `[codeHash]` on the table `RecoveryCode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RecoveryCode_codeHash_key" ON "RecoveryCode"("codeHash");
