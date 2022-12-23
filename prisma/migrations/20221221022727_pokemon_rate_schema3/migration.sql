/*
  Warnings:

  - Added the required column `zxczxc` to the `Pokemon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pokemon" ADD COLUMN     "zxczxc" TEXT NOT NULL;
