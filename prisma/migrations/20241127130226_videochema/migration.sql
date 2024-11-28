/*
  Warnings:

  - Made the column `category` on table `Video` required. This step will fail if there are existing NULL values in that column.
  - Made the column `channelId` on table `Video` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_channelId_fkey";

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "duration" INTEGER,
ALTER COLUMN "thumbnailUrl" DROP NOT NULL,
ALTER COLUMN "thumbnailUrl" DROP DEFAULT,
ALTER COLUMN "category" SET NOT NULL,
ALTER COLUMN "channelId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
