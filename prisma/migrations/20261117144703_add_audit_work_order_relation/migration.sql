-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "workOrderId" TEXT;

-- CreateIndex
CREATE INDEX "AuditLog_workOrderId_idx" ON "AuditLog"("workOrderId");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
