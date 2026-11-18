-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVED', 'REWORK');

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "serviceReportId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "comments" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");

-- CreateIndex
CREATE INDEX "Review_reviewedAt_idx" ON "Review"("reviewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_serviceReportId_key" ON "Review"("serviceReportId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_serviceReportId_fkey" FOREIGN KEY ("serviceReportId") REFERENCES "ServiceReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
