-- CreateTable
CREATE TABLE "InvitationAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InvitationAsset_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "WeddingProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "InvitationAsset_path_key" ON "InvitationAsset"("path");

-- CreateIndex
CREATE INDEX "InvitationAsset_profileId_idx" ON "InvitationAsset"("profileId");

