/*
  Warnings:

  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_postId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "video" TEXT;

-- DropTable
DROP TABLE "Video";
