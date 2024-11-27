/*
  Warnings:

  - Added the required column `description` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_path` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PROCESSING', 'COMPLETED');

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "file_path" TEXT NOT NULL,
ADD COLUMN     "processing_status" "Status" NOT NULL DEFAULT 'PROCESSING',
ADD COLUMN     "qualities" TEXT[];
