/*
  Warnings:

  - You are about to drop the column `updateAt` on the `Problem` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
