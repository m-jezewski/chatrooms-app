/*
  Warnings:

  - You are about to drop the column `verificationToken` on the `TextChannel` table. All the data in the column will be lost.
  - Added the required column `authKeyHash` to the `TextChannel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TextChannel" DROP COLUMN "verificationToken",
ADD COLUMN     "authKeyHash" TEXT NOT NULL;
