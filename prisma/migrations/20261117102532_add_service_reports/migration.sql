-- CreateTable
CREATE TABLE "ServiceReport" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceReport_workOrderId_idx" ON "ServiceReport"("workOrderId");

-- CreateIndex
CREATE INDEX "ServiceReport_technicianId_idx" ON "ServiceReport"("technicianId");

-- CreateIndex
CREATE INDEX "ServiceReport_submittedAt_idx" ON "ServiceReport"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceReport_workOrderId_version_key" ON "ServiceReport"("workOrderId", "version");

-- AddForeignKey
ALTER TABLE "ServiceReport" ADD CONSTRAINT "ServiceReport_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceReport" ADD CONSTRAINT "ServiceReport_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
