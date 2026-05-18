-- CreateTable
CREATE TABLE "GoogleCredentials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "encryptedRefreshToken" TEXT NOT NULL,
    "encryptedAccessToken" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL
);
