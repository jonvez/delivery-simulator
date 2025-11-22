-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "driverId" TEXT;

-- CreateIndex
CREATE INDEX "orders_driverId_idx" ON "orders"("driverId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
