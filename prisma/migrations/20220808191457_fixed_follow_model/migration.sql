/*
  Warnings:

  - Added the required column `followedUserPfp` to the `Follow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `followedUsername` to the `Follow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Follow" ADD COLUMN     "followedUserPfp" TEXT NOT NULL,
ADD COLUMN     "followedUsername" TEXT NOT NULL;
