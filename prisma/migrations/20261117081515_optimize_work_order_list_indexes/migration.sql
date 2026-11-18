-- DropIndex
DROP INDEX "WorkOrder_status_idx";

-- CreateIndex
CREATE INDEX "WorkOrder_createdAt_idx" ON "WorkOrder"("createdAt");

-- CreateIndex
CREATE INDEX "WorkOrder_status_createdAt_idx" ON "WorkOrder"("status", "createdAt");

-- CreateIndex
CREATE INDEX "WorkOrder_priority_createdAt_idx" ON "WorkOrder"("priority", "createdAt");
