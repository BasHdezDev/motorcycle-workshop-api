-- CreateEnum
CREATE TYPE "ServiceOrderStatus" AS ENUM ('RECEIVED', 'UNDER_DIAGNOSIS', 'UNDER_REPAIR', 'READY', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Driver" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Motorcycle" (
    "id" UUID NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "engineDisplacement" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "chassisNumber" TEXT NOT NULL,
    "engineNumber" TEXT NOT NULL,
    "driverId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Motorcycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceOrder" (
    "id" UUID NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "motorcycleId" UUID NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3),
    "problemDescription" TEXT NOT NULL,
    "diagnosis" TEXT,
    "workPerformed" TEXT,
    "status" "ServiceOrderStatus" NOT NULL DEFAULT 'RECEIVED',
    "repairCost" DECIMAL(10,2),
    "paymentCompleted" BOOLEAN NOT NULL DEFAULT false,
    "paymentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_documentNumber_key" ON "Driver"("documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_email_key" ON "Driver"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Motorcycle_licensePlate_key" ON "Motorcycle"("licensePlate");

-- CreateIndex
CREATE UNIQUE INDEX "Motorcycle_chassisNumber_key" ON "Motorcycle"("chassisNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Motorcycle_engineNumber_key" ON "Motorcycle"("engineNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOrder_orderNumber_key" ON "ServiceOrder"("orderNumber");

-- AddForeignKey
ALTER TABLE "Motorcycle" ADD CONSTRAINT "Motorcycle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
