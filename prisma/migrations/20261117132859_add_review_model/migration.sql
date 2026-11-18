-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_serviceReportId_fkey";

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_serviceReportId_fkey" FOREIGN KEY ("serviceReportId") REFERENCES "ServiceReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
