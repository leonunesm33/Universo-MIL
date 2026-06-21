-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_lessonId_fkey";

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "moduleId" TEXT,
ALTER COLUMN "lessonId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "NPSCampaign" ADD COLUMN     "deadlineDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "NPSResponse" ADD COLUMN     "leaderId" TEXT;

-- AlterTable
ALTER TABLE "PlatformConfig" ADD COLUMN     "websiteUrl" TEXT;

-- CreateTable
CREATE TABLE "NPSLeader" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "NPSLeader_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPSLeader" ADD CONSTRAINT "NPSLeader_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "NPSCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPSResponse" ADD CONSTRAINT "NPSResponse_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "NPSLeader"("id") ON DELETE SET NULL ON UPDATE CASCADE;
