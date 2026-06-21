-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('MODULE', 'COURSE');

-- AlterTable
ALTER TABLE "ChecklistResponse" ADD COLUMN     "storeId" TEXT;

-- AlterTable
ALTER TABLE "ChecklistTemplate" ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "linkUrl" TEXT;

-- AlterTable
ALTER TABLE "ClimateResearch" ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "linkUrl" TEXT;

-- AlterTable
ALTER TABLE "ClimateResponse" ADD COLUMN     "storeId" TEXT;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "documentUrl" TEXT;

-- AlterTable
ALTER TABLE "POPDocument" ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "linkUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "storeId" TEXT;

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CertificateType" NOT NULL,
    "courseId" TEXT,
    "moduleId" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NPSQuestion" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SCALE',
    "options" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NPSQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NPSAnswer" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "NPSAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_code_key" ON "Store"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_userId_moduleId_type_key" ON "Certificate"("userId", "moduleId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_userId_courseId_type_key" ON "Certificate"("userId", "courseId", "type");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClimateResponse" ADD CONSTRAINT "ClimateResponse_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistResponse" ADD CONSTRAINT "ChecklistResponse_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPSQuestion" ADD CONSTRAINT "NPSQuestion_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "NPSCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPSAnswer" ADD CONSTRAINT "NPSAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "NPSResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPSAnswer" ADD CONSTRAINT "NPSAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "NPSQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
