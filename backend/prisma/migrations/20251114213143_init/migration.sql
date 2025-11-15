-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'WON', 'LOST', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "unitPrice" DECIMAL(10,2),
    "warrantyText" TEXT,
    "scopeIntro" TEXT,
    "scopeBullets" JSONB,
    "componentBullets" JSONB,
    "tags" TEXT[],
    "imageUrl" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "ownerEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "repName" TEXT,
    "repPhone" TEXT,
    "repEmail" TEXT,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "customerAddress" TEXT,
    "jobName" TEXT,
    "companyName" TEXT,
    "companyAddress" TEXT,
    "companyPhone" TEXT,
    "companySite" TEXT,
    "systemName" TEXT,
    "productId" TEXT,
    "fortified" BOOLEAN NOT NULL DEFAULT false,
    "applyPreset" BOOLEAN NOT NULL DEFAULT true,
    "showDisclaimer" BOOLEAN NOT NULL DEFAULT false,
    "disclaimerText" TEXT,
    "areas" JSONB NOT NULL,
    "deckAllowance" JSONB,
    "adders" JSONB,
    "taxRate" DECIMAL(5,2),
    "subtotal" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "scopeIntro" TEXT,
    "scopeBullets" JSONB,
    "components" JSONB,
    "pricingLines" JSONB,
    "notes" TEXT,
    "altPlyText" TEXT,
    "rawQuoteText" TEXT,
    "pdfPath" TEXT,
    "goHighLevelOpportunityId" TEXT,
    "goHighLevelContactId" TEXT,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
