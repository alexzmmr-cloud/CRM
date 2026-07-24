-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "industry" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "closedAt" TIMESTAMP(3);
