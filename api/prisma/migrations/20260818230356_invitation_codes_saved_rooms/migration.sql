/*
  Warnings:

  - You are about to drop the `_ChannelMembers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[inviteCode]` on the table `TextChannel` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inviteCode` to the `TextChannel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ChannelMembers" DROP CONSTRAINT "_ChannelMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChannelMembers" DROP CONSTRAINT "_ChannelMembers_B_fkey";

-- AlterTable
ALTER TABLE "TextChannel" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "inviteCode" TEXT NOT NULL,
ADD COLUMN     "ownerTokenHash" TEXT;

-- DropTable
DROP TABLE "_ChannelMembers";

-- CreateTable
CREATE TABLE "SavedRoom" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "userId" UUID NOT NULL,
    "roomId" UUID NOT NULL,

    CONSTRAINT "SavedRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedRoom_userId_roomId_key" ON "SavedRoom"("userId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "TextChannel_inviteCode_key" ON "TextChannel"("inviteCode");

-- AddForeignKey
ALTER TABLE "SavedRoom" ADD CONSTRAINT "SavedRoom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedRoom" ADD CONSTRAINT "SavedRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "TextChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
