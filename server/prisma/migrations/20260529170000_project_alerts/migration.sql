-- CreateTable
CREATE TABLE "ProjectAlert" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "label" TEXT,
    "industry" TEXT,
    "country" TEXT,
    "q" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notifyByEmail" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectAlert_userId_isActive_idx" ON "ProjectAlert"("userId", "isActive");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt");

-- AddForeignKey
ALTER TABLE "ProjectAlert" ADD CONSTRAINT "ProjectAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
