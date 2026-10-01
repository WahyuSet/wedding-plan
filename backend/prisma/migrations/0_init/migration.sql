-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WeddingProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "groomName" TEXT,
    "brideName" TEXT,
    "weddingDate" DATETIME,
    "venue" TEXT,
    "totalBudget" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeddingProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BudgetItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "estimatedCost" REAL NOT NULL DEFAULT 0,
    "actualCost" REAL NOT NULL DEFAULT 0,
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "vendorName" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BudgetItem_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "WeddingProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SeserahanItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'lainnya',
    "estimatedPrice" REAL NOT NULL DEFAULT 0,
    "actualPrice" REAL NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isPrepared" BOOLEAN NOT NULL DEFAULT false,
    "giver" TEXT NOT NULL DEFAULT 'groom',
    "brand" TEXT,
    "link" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SeserahanItem_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "WeddingProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OperasionalTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "scheduledTime" TEXT,
    "scheduledDate" DATETIME,
    "assignedTo" TEXT,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OperasionalTask_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "WeddingProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KuaDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "documentCode" TEXT,
    "documentType" TEXT NOT NULL DEFAULT 'persyaratan',
    "fromParty" TEXT NOT NULL,
    "deadline" DATETIME,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KuaDocument_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "WeddingProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DigitalInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'noir-calla',
    "title" TEXT NOT NULL DEFAULT 'The Wedding of',
    "openingQuote" TEXT DEFAULT 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
    "quoteSource" TEXT DEFAULT 'QS. Ar-Rum: 21',
    "bgMusicUrl" TEXT DEFAULT 'https://assets.mixkit.co/music/preview/mixkit-romantic-moment-1147.mp3',
    "isMusicAutoPlay" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
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

-- CreateTable
CREATE TABLE "InvitationRsvp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invitationId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "attendanceStatus" TEXT NOT NULL DEFAULT 'hadir',
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InvitationRsvp_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "DigitalInvitation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvitationGuest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invitationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "phone" TEXT,
    "category" TEXT DEFAULT 'keluarga',
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InvitationGuest_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "DigitalInvitation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL DEFAULT 'true',
    "label" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingProfile_userId_key" ON "WeddingProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalInvitation_profileId_key" ON "DigitalInvitation"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalInvitation_slug_key" ON "DigitalInvitation"("slug");

