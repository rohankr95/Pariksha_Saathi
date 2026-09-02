-- AlterTable
ALTER TABLE "ClassRequest" ADD COLUMN     "upvoterIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
