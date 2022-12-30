-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_votedAgainst_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_votedFor_fkey";

-- AlterTable
ALTER TABLE "Pokemon" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Pokemon_id_seq";

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_votedFor_fkey" FOREIGN KEY ("votedFor") REFERENCES "Pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_votedAgainst_fkey" FOREIGN KEY ("votedAgainst") REFERENCES "Pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
