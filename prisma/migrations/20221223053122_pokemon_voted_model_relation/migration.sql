/*
  Warnings:

  - A unique constraint covering the columns `[pokemonId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pokemonId` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "pokemonId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vote_pokemonId_key" ON "Vote"("pokemonId");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
