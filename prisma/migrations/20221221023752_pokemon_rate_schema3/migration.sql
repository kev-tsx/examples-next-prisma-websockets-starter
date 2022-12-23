/*
  Warnings:

  - Added the required column `kevin123` to the `Pokemon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pokemon" ADD COLUMN     "kevin123" TEXT NOT NULL;
