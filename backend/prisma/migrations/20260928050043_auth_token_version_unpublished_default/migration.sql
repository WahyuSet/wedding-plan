-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DigitalInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'noir-calla',
    "title" TEXT NOT NULL DEFAULT 'The Wedding of',
    "openingQuote" TEXT DEFAULT 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
    "quoteSource" TEXT DEFAULT 'QS. Ar-Rum: 21',
    "bgMusicUrl" TEXT DEFAULT 'https://assets.mixkit.co/music/preview/mixkit-romantic-moment-1147.mp3',
    "isMusicAutoPlay" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "coverPhotoUrl" TEXT DEFAULT 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=80',
    "heroPhotoUrl" TEXT DEFAULT 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&auto=format&fit=crop&q=80',
    "groomFullName" TEXT,
    "groomNickName" TEXT,
    "groomFather" TEXT,
    "groomMother" TEXT,
    "groomInstagram" TEXT,
    "groomPhotoUrl" TEXT,
    "brideFullName" TEXT,
    "brideNickName" TEXT,
    "brideFather" TEXT,
    "brideMother" TEXT,
    "brideInstagram" TEXT,
    "bridePhotoUrl" TEXT,
    "akadDate" DATETIME,
    "akadStartTime" TEXT DEFAULT '08:00',
    "akadEndTime" TEXT DEFAULT '10:00',
    "akadVenueName" TEXT,
    "akadAddress" TEXT,
    "akadMapUrl" TEXT,
    "resepsiDate" DATETIME,
    "resepsiStartTime" TEXT DEFAULT '11:00',
    "resepsiEndTime" TEXT DEFAULT '14:00',
    "resepsiVenueName" TEXT,
    "resepsiAddress" TEXT,
    "resepsiMapUrl" TEXT,
    "loveStory" TEXT,
    "galleryPhotos" TEXT,
    "bankAccounts" TEXT,
    "giftAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DigitalInvitation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "WeddingProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DigitalInvitation" ("akadAddress", "akadDate", "akadEndTime", "akadMapUrl", "akadStartTime", "akadVenueName", "bankAccounts", "bgMusicUrl", "brideFather", "brideFullName", "brideInstagram", "brideMother", "brideNickName", "bridePhotoUrl", "coverPhotoUrl", "createdAt", "galleryPhotos", "giftAddress", "groomFather", "groomFullName", "groomInstagram", "groomMother", "groomNickName", "groomPhotoUrl", "heroPhotoUrl", "id", "isMusicAutoPlay", "isPublished", "loveStory", "openingQuote", "profileId", "quoteSource", "resepsiAddress", "resepsiDate", "resepsiEndTime", "resepsiMapUrl", "resepsiStartTime", "resepsiVenueName", "slug", "theme", "title", "updatedAt") SELECT "akadAddress", "akadDate", "akadEndTime", "akadMapUrl", "akadStartTime", "akadVenueName", "bankAccounts", "bgMusicUrl", "brideFather", "brideFullName", "brideInstagram", "brideMother", "brideNickName", "bridePhotoUrl", "coverPhotoUrl", "createdAt", "galleryPhotos", "giftAddress", "groomFather", "groomFullName", "groomInstagram", "groomMother", "groomNickName", "groomPhotoUrl", "heroPhotoUrl", "id", "isMusicAutoPlay", "isPublished", "loveStory", "openingQuote", "profileId", "quoteSource", "resepsiAddress", "resepsiDate", "resepsiEndTime", "resepsiMapUrl", "resepsiStartTime", "resepsiVenueName", "slug", "theme", "title", "updatedAt" FROM "DigitalInvitation";
DROP TABLE "DigitalInvitation";
ALTER TABLE "new_DigitalInvitation" RENAME TO "DigitalInvitation";
CREATE UNIQUE INDEX "DigitalInvitation_profileId_key" ON "DigitalInvitation"("profileId");
CREATE UNIQUE INDEX "DigitalInvitation_slug_key" ON "DigitalInvitation"("slug");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "password", "role", "updatedAt", "username") SELECT "createdAt", "email", "id", "password", "role", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
