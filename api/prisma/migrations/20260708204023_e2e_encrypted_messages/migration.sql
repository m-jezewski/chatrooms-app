/*
  Warnings:

  - You are about to drop the column `authorId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `_TextChannelToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `payload` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salt` to the `TextChannel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verificationToken` to the `TextChannel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_authorId_fkey";

-- DropForeignKey
ALTER TABLE "_TextChannelToUser" DROP CONSTRAINT "_TextChannelToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_TextChannelToUser" DROP CONSTRAINT "_TextChannelToUser_B_fkey";

-- DropIndex
DROP INDEX "TextChannel_name_key";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "authorId",
DROP COLUMN "content",
ADD COLUMN     "payload" TEXT NOT NULL,
ADD COLUMN     "senderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TextChannel" ADD COLUMN     "ownerId" UUID,
ADD COLUMN     "salt" TEXT NOT NULL,
ADD COLUMN     "verificationToken" TEXT NOT NULL;

-- DropTable
DROP TABLE "_TextChannelToUser";

-- CreateTable
CREATE TABLE "_ChannelMembers" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ChannelMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ChannelMembers_B_index" ON "_ChannelMembers"("B");

-- AddForeignKey
ALTER TABLE "TextChannel" ADD CONSTRAINT "TextChannel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelMembers" ADD CONSTRAINT "_ChannelMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "TextChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelMembers" ADD CONSTRAINT "_ChannelMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
