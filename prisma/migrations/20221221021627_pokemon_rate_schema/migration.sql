/*
  Warnings:

  - You are about to drop the column `rateId` on the `Pokemon` table. All the data in the column will be lost.
  - You are about to drop the `Rate` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Pokemon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rate` to the `Pokemon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Pokemon` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Pokemon" DROP CONSTRAINT "Pokemon_rateId_fkey";

-- AlterTable
ALTER TABLE "Pokemon" DROP COLUMN "rateId",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "rate" INTEGER NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;

-- DropTable
DROP TABLE "Rate";
