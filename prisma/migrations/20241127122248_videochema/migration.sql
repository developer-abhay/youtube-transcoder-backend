/*
  Warnings:

  - You are about to drop the column `processing_status` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "processing_status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PROCESSING',
ADD COLUMN     "videoUrls" JSONB;
