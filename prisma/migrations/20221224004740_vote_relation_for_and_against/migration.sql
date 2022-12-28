/*
  Warnings:

  - You are about to drop the column `rate` on the `Pokemon` table. All the data in the column will be lost.
  - You are about to drop the column `pokemonId` on the `Vote` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_pokemonId_fkey";

-- AlterTable
ALTER TABLE "Pokemon" DROP COLUMN "rate";

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "pokemonId";

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_votedFor_fkey" FOREIGN KEY ("votedFor") REFERENCES "Pokemon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_votedAgainst_fkey" FOREIGN KEY ("votedAgainst") REFERENCES "Pokemon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
