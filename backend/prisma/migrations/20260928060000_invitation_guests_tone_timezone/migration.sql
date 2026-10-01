-- AlterTable
ALTER TABLE "InvitationGuest" ADD COLUMN "code" TEXT;
UPDATE "InvitationGuest" SET "code" = lower(hex(randomblob(6))) WHERE "code" IS NULL;

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
    "tone" TEXT NOT NULL DEFAULT 'islami',
    "timezone" TEXT NOT NULL DEFAULT 'WIB',
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
CREATE TABLE "new_InvitationRsvp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invitationId" TEXT NOT NULL,
    "guestId" TEXT,
    "guestName" TEXT NOT NULL,
    "attendanceStatus" TEXT NOT NULL DEFAULT 'hadir',
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InvitationRsvp_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "DigitalInvitation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InvitationRsvp_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "InvitationGuest" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InvitationRsvp" ("attendanceStatus", "createdAt", "guestCount", "guestName", "id", "invitationId", "message") SELECT "attendanceStatus", "createdAt", "guestCount", "guestName", "id", "invitationId", "message" FROM "InvitationRsvp";
DROP TABLE "InvitationRsvp";
ALTER TABLE "new_InvitationRsvp" RENAME TO "InvitationRsvp";
CREATE UNIQUE INDEX "InvitationRsvp_guestId_key" ON "InvitationRsvp"("guestId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "InvitationGuest_code_key" ON "InvitationGuest"("code");

