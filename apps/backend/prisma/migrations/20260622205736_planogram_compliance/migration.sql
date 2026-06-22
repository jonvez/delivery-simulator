-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "planogramNotes" TEXT,
ADD COLUMN     "planogramReviewed" BOOLEAN NOT NULL DEFAULT false;
