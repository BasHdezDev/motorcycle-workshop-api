-- CreateEnum
CREATE TYPE "ServiceOrderPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "ServiceOrder" ADD COLUMN     "priority" "ServiceOrderPriority" NOT NULL DEFAULT 'NORMAL';
