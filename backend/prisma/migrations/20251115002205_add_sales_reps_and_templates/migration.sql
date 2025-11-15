-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "repId" TEXT;

-- CreateTable
CREATE TABLE "SalesRep" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesRep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalesRep_email_key" ON "SalesRep"("email");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_repId_fkey" FOREIGN KEY ("repId") REFERENCES "SalesRep"("id") ON DELETE SET NULL ON UPDATE CASCADE;
